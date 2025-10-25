import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { prisma } from '@/lib/prisma'

// Note: Email services will be integrated later
// import { sendBookingConfirmationEmail, sendPaymentReceiptEmail } from '@/services/email.service'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing signature' }, 
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' }, 
      { status: 400 }
    )
  }

  console.log(`🎯 Webhook received: ${event.type}`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object)
        break
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { id: paymentIntentId } = paymentIntent
  
  console.log(`💳 Payment succeeded: ${paymentIntentId}`)
  
  try {
    // Find the booking by payment intent ID
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: {
        booking: {
          include: {
            user: { select: { email: true, name: true } },
            villa: { select: { name: true, slug: true } }
          }
        }
      }
    })

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntentId}`)
      return
    }

    const bookingId = payment.booking.id

    // Update payment and booking status in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          processedAt: new Date(),
          transactionId: (typeof paymentIntent.latest_charge === 'string' 
            ? paymentIntent.latest_charge 
            : paymentIntent.id)
        }
      })

      // Update booking status
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        },
        include: {
          user: { select: { email: true, name: true } },
          villa: { select: { name: true, slug: true } }
        }
      })

      return { payment: updatedPayment, booking }
    })

    console.log(`📧 Sending confirmation emails for booking: ${bookingId}`)

    // Send confirmation email to guest
    const guestEmail = result.booking.user?.email || result.booking.guestEmail
    if (guestEmail) {
      try {
        await sendBookingConfirmationEmailStub(
          guestEmail,
          {
            bookingId: result.booking.id,
            villaName: result.booking.villa.name,
            checkIn: result.booking.checkIn,
            checkOut: result.booking.checkOut,
            guests: result.booking.guests,
            totalAmount: result.booking.totalAmount,
            currency: result.booking.currency
          },
          result.booking.user?.name || result.booking.guestName
        )

        // Send payment receipt
        await sendPaymentReceiptEmailStub(
          guestEmail,
          {
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            receiptUrl: paymentIntent.charges?.data[0]?.receipt_url
          }
        )

        console.log(`✅ Emails sent successfully for booking: ${bookingId}`)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the webhook for email errors
      }
    }

    console.log(`✅ Payment processing completed for booking: ${bookingId}`)
    
  } catch (error) {
    console.error('Error handling successful payment:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  const { id: paymentIntentId } = paymentIntent
  
  console.log(`❌ Payment failed: ${paymentIntentId}`)
  
  try {
    // Update payment status
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: { booking: true }
    })

    if (!payment) {
      console.error(`Payment not found for failed intent: ${paymentIntentId}`)
      return
    }

    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          processedAt: new Date()
        }
      })

      // Update booking status
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      })
    })

    console.log(`✅ Payment failure processed for booking: ${payment.bookingId}`)
    
  } catch (error) {
    console.error('Error handling failed payment:', error)
    throw error
  }
}

async function handleChargeDispute(charge: any) {
  const { id: chargeId, payment_intent: paymentIntentId } = charge
  
  console.log(`⚠️ Charge dispute created: ${chargeId}`)
  
  try {
    // Find payment by charge ID or payment intent
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId: chargeId },
          { paymentIntentId: paymentIntentId }
        ]
      },
      include: { booking: true }
    })

    if (!payment) {
      console.error(`Payment not found for disputed charge: ${chargeId}`)
      return
    }

    // Update payment status to reflect dispute
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED', // Temporary status during dispute
        processedAt: new Date()
      }
    })

    // TODO: Implement dispute handling logic
    // - Notify admin
    // - Prepare dispute response

  } catch (error) {
    console.error('Error handling charge dispute:', error)
    throw error
  }
}

// Stub email functions (to be implemented)
async function sendBookingConfirmationEmailStub(
  to: string, 
  _bookingData: any, 
  _userName?: string
) {
  // Will implement with existing email service
  console.log(`📧 Would send booking confirmation to: ${to}`)
}

async function sendPaymentReceiptEmailStub(
  to: string, 
  _paymentData: any
) {
  // Will implement with existing email service  
  console.log(`📧 Would send payment receipt to: ${to}`)
}