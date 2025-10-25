import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      villaId, 
      villaName, 
      checkIn, 
      checkOut, 
      guests, 
      totalAmount, 
      customerEmail, 
      customerName 
    } = body;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'thb', // Thai Baht
      metadata: {
        villaId,
        villaName,
        checkIn,
        checkOut,
        guests: guests.toString(),
        customerEmail,
        customerName,
        bookingType: 'villa_reservation'
      },
      receipt_email: customerEmail,
    });

    console.log('✅ Payment Intent created:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('❌ Payment Intent creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment creation failed'
    }, { status: 500 });
  }
}