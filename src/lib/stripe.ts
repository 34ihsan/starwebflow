import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2024-06-20' as any,
});

export const isStripeEnabled = !!process.env.STRIPE_SECRET_KEY;
