import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') || '';

  let event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (process.env.NODE_ENV === 'production' && !webhookSecret) {
    console.error('CRITICAL SECURITY ERROR: STRIPE_WEBHOOK_SECRET is missing in production environment!');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  try {
    if (!webhookSecret) {
      // Allow unsigned payloads only in non-production local development environment
      console.warn('WARNING: STRIPE_WEBHOOK_SECRET is missing. Bypassing signature verification (Development mode only).');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      try {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
          },
        });
        console.log(`Invoice ${invoiceId} updated to paid successfully via Stripe webhook.`);
      } catch (dbError) {
        console.error(`Error updating invoice status in DB:`, dbError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
