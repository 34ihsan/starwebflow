import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageLimitError';
  }
}

export class UpgradeRequiredError extends Error {
  constructor(message: string = 'Please upgrade your plan to access this feature.') {
    super(message);
    this.name = 'UpgradeRequiredError';
  }
}

type GenerationType = 'image' | 'video' | 'text';

const PLAN_LIMITS: Record<string, Record<GenerationType, number>> = {
  FREE: {
    image: 1, // 1 image per day
    video: 0, // 0 video per day
    text: 10, // 10 text generations per day
  },
  PRO: {
    image: 50,
    video: 5,
    text: 500,
  },
  AGENCY: {
    image: 500,
    video: 50,
    text: 5000,
  }
};

/**
 * Checks if the request can proceed based on usage limits.
 * Call this BEFORE performing the AI generation.
 * @param tenantId The ID of the tenant.
 * @param type The type of generation ('image', 'video', 'text').
 * @param ipAddress The IP address of the incoming request to prevent abuse.
 */
export async function checkAndIncrementUsage(tenantId: string, type: GenerationType, ipAddress: string) {
  // 1. Get Tenant Subscription
  let subscription = await prisma.tenantSubscription.findUnique({
    where: { tenantId }
  });

  if (!subscription) {
    subscription = await prisma.tenantSubscription.create({
      data: { tenantId }
    });
  }

  // 2. Check if trial is expired
  const now = new Date();
  if (subscription.planId === 'FREE' && subscription.trialEndsAt) {
    if (now > subscription.trialEndsAt) {
      throw new UpgradeRequiredError('Your 14-day free trial has expired. Please upgrade your plan.');
    }
  }

  // 3. IP Abuse Check for FREE tier
  if (subscription.planId === 'FREE') {
    if (type === 'video') {
      throw new UpgradeRequiredError('Video generation is not available on the free plan.');
    }

    let ipTracker = await prisma.ipUsageTracker.findUnique({
      where: { ipAddress }
    });

    if (!ipTracker) {
      ipTracker = await prisma.ipUsageTracker.create({
        data: { ipAddress }
      });
    }

    // Reset daily IP tracker if needed
    if (ipTracker.lastResetAt.getDate() !== now.getDate() || 
        ipTracker.lastResetAt.getMonth() !== now.getMonth() || 
        ipTracker.lastResetAt.getFullYear() !== now.getFullYear()) {
      ipTracker = await prisma.ipUsageTracker.update({
        where: { id: ipTracker.id },
        data: { imageGenerations: 0, lastResetAt: now }
      });
    }

    // Check IP limit (strictly 1 image per day per IP across ALL free accounts)
    if (type === 'image' && ipTracker.imageGenerations >= PLAN_LIMITS['FREE'].image) {
      throw new UpgradeRequiredError('Daily image generation limit reached for this IP address. Please upgrade your plan.');
    }
    
    // Increment IP tracker
    if (type === 'image') {
       await prisma.ipUsageTracker.update({
         where: { id: ipTracker.id },
         data: { imageGenerations: { increment: 1 } }
       });
    }
  }

  // 4. Check Tenant Usage
  let usage = await prisma.tenantUsage.findUnique({
    where: { tenantId }
  });

  if (!usage) {
    usage = await prisma.tenantUsage.create({
      data: { tenantId }
    });
  }

  // Reset daily usage if needed
  if (usage.lastResetAt.getDate() !== now.getDate() || 
      usage.lastResetAt.getMonth() !== now.getMonth() || 
      usage.lastResetAt.getFullYear() !== now.getFullYear()) {
    usage = await prisma.tenantUsage.update({
      where: { id: usage.id },
      data: { 
        imageGenerations: 0, 
        videoGenerations: 0, 
        textGenerations: 0, 
        lastResetAt: now 
      }
    });
  }

  const limits = PLAN_LIMITS[subscription.planId] || PLAN_LIMITS['FREE'];
  
  if (type === 'image' && usage.imageGenerations >= limits.image) {
     throw new UpgradeRequiredError('You have reached your daily image generation limit. Please upgrade your plan.');
  }
  
  if (type === 'video' && usage.videoGenerations >= limits.video) {
     throw new UpgradeRequiredError('You have reached your daily video generation limit. Please upgrade your plan.');
  }

  if (type === 'text' && usage.textGenerations >= limits.text) {
     throw new UpgradeRequiredError('You have reached your daily text generation limit. Please upgrade your plan.');
  }

  // Increment Tenant Usage
  if (type === 'image') {
    await prisma.tenantUsage.update({
      where: { id: usage.id },
      data: { imageGenerations: { increment: 1 } }
    });
  } else if (type === 'video') {
    await prisma.tenantUsage.update({
      where: { id: usage.id },
      data: { videoGenerations: { increment: 1 } }
    });
  } else if (type === 'text') {
    await prisma.tenantUsage.update({
      where: { id: usage.id },
      data: { textGenerations: { increment: 1 } }
    });
  }

  return true;
}

/**
 * Utility to wrap API responses and catch Upgrade errors.
 */
export function handleUsageError(error: any) {
  if (error instanceof UpgradeRequiredError) {
    return NextResponse.json({ error: error.message, code: 'UPGRADE_REQUIRED' }, { status: 402 });
  }
  if (error instanceof UsageLimitError) {
    return NextResponse.json({ error: error.message, code: 'LIMIT_REACHED' }, { status: 429 });
  }
  
  console.error("Internal Server Error:", error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
