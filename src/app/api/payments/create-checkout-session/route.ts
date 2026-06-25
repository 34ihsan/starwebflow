import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, isStripeEnabled } from '@/lib/stripe';
import { z } from 'zod';

const requestSchema = z.object({
  invoiceId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    // 1. Basic CORS/CSRF origin verification
    const host = req.headers.get('host') || '';
    const origin = req.headers.get('origin') || '';
    
    // In production, enforce that origin must be matching host
    if (origin && !origin.includes(host) && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized origin request rejected' }, { status: 403 });
    }

    // 2. Validate payload using Zod
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid invoice ID format' }, { status: 400 });
    }

    const { invoiceId } = result.data;

    // 3. Retrieve invoice from DB securely
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        clientCompany: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if the invoice is already paid
    if (invoice.status === 'paid' || invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    if (!isStripeEnabled) {
      return NextResponse.json({ error: 'Stripe integration is currently offline' }, { status: 400 });
    }

    const redirectOrigin = origin || `http://${host}`;

    // Create Stripe Checkout Session securely
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice #${invoice.invoiceNo}`,
              description: `Payment for invoice #${invoice.invoiceNo}`,
            },
            unit_amount: Math.round(Number(invoice.grossAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: invoice.clientCompany?.email || undefined,
      metadata: {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
      },
      success_url: `${redirectOrigin}/client/invoices?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectOrigin}/client/invoices?canceled=true`,
    });

    // Save session ID
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        stripeInvoiceId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Secure checkout session creation error:', error);
    return NextResponse.json({ error: 'An unexpected system error occurred' }, { status: 500 });
  }
}
