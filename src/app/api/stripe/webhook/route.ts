import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (error: any) {
    console.error(`Webhook signature verification failed.`, error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await handleSubscriptionUpdated(subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return NextResponse.json({ error: 'Webhook processing error.' }, { status: 500 });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // We identify the tenant via metadata stored in the subscription or customer
  const customerId = subscription.customer as string;
  
  // Try to find the tenant subscription
  const tenantSubscription = await prisma.tenantSubscription.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!tenantSubscription) {
    console.log(`No tenant found for stripe customer ${customerId}`);
    // If not found, perhaps it was created in Stripe dashboard without our metadata yet. 
    // In a real app, you ensure customer mapping happens before checkout.
    return;
  }

  // Derive plan from Price ID (This mapping should ideally be dynamic or environment-based)
  let planId = 'FREE';
  const priceId = subscription.items.data[0]?.price.id;
  
  // Example mapping - update based on your actual Stripe Price IDs
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    planId = 'PRO';
  } else if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
    planId = 'AGENCY';
  }

  await prisma.tenantSubscription.update({
    where: { id: tenantSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      planId: planId,
      status: subscription.status, // active, trialing, past_due, canceled
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    }
  });

  // Since a plan upgrade happens instantly, we should also reset their usage limits
  if (subscription.status === 'active') {
    await prisma.tenantUsage.upsert({
      where: { tenantId: tenantSubscription.tenantId },
      update: {
        lastResetAt: new Date(),
        imageGenerations: 0,
        videoGenerations: 0,
        textGenerations: 0,
      },
      create: {
        tenantId: tenantSubscription.tenantId,
      }
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const tenantSubscription = await prisma.tenantSubscription.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!tenantSubscription) return;

  await prisma.tenantSubscription.update({
    where: { id: tenantSubscription.id },
    data: {
      status: 'CANCELED',
      planId: 'FREE', // Revert to free/trial limits
      cancelAtPeriodEnd: false,
    }
  });
}
