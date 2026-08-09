import { NextResponse } from 'next/server';
import { stripe, isStripeEnabled } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth'; // Adjust based on your auth implementation
// import { authOptions } from '@/lib/auth'; // Adjust based on your auth implementation

export async function POST(req: Request) {
  if (!isStripeEnabled) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  try {
    // 1. Get the current user and their tenant
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // For this example, let's assume we receive the tenantId from the body or headers
    const body = await req.json();
    const { tenantId, priceId } = body;

    if (!tenantId || !priceId) {
      return NextResponse.json({ error: 'Missing tenantId or priceId' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // 2. Determine if we should create a Checkout Session or Customer Portal
    if (tenant.subscription?.stripeCustomerId && tenant.subscription.planId !== 'FREE') {
      // User is already a paying customer, redirect to Stripe Billing Portal to manage subscription
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: tenant.subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // 3. User is on FREE/TRIAL, create a Checkout Session to upgrade
    let customerId = tenant.subscription?.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        name: tenant.name,
        metadata: {
          tenantId: tenant.id
        }
      });
      customerId = customer.id;

      // Ensure a TenantSubscription exists
      await prisma.tenantSubscription.upsert({
        where: { tenantId: tenant.id },
        update: { stripeCustomerId: customerId },
        create: {
          tenantId: tenant.id,
          stripeCustomerId: customerId,
        }
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        tenantId: tenant.id
      }
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
