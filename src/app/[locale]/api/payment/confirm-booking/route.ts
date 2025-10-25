import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { sendBookingConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const {
        villaId,
        villaName,
        checkIn,
        checkOut,
        guests,
  customerEmail
      } = paymentIntent.metadata;

      // Generate booking confirmation ID
      const bookingId = `EVS-${Date.now()}-${paymentIntentId.slice(-6).toUpperCase()}`;

      // Send confirmation email
      try {
        // TODO: Re-enable email functionality
        // await sendBookingConfirmationEmail({
        //   bookingId,
        //   customerEmail,
        //   customerName,
        //   villaName,
        //   checkIn,
        //   checkOut,
        //   guests: parseInt(guests),
        //   totalAmount: paymentIntent.amount / 100, // Convert from cents
        //   paymentIntentId
        // });
        console.log('✅ Email confirmation disabled temporarily:', customerEmail);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Continue even if email fails
      }

      // Here you would typically save booking to database
      console.log('✅ Booking confirmed:', {
        bookingId,
        paymentIntentId,
        villaName,
        customerEmail,
        amount: paymentIntent.amount / 100
      });

      return NextResponse.json({
        success: true,
        bookingId,
        message: 'Booking confirmed successfully',
        booking: {
          id: bookingId,
          villaId,
          villaName,
          checkIn,
          checkOut,
          guests: parseInt(guests),
          totalAmount: paymentIntent.amount / 100,
          status: 'confirmed',
          paymentStatus: 'paid'
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Payment not completed'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Booking confirmation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Booking confirmation failed'
    }, { status: 500 });
  }
}