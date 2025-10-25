'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Shield, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  bookingData: {
    villaId: string;
    villaName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    totalAmount: number;
  };
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({ bookingData, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          villaId: bookingData.villaId,
          villaName: bookingData.villaName,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          totalAmount: bookingData.totalAmount,
          customerEmail: bookingData.email,
          customerName: `${bookingData.firstName} ${bookingData.lastName}`,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${bookingData.firstName} ${bookingData.lastName}`,
            email: bookingData.email,
            phone: bookingData.phone,
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        setPaymentError(error.message || 'Payment failed');
        onPaymentError(error.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 3: Confirm booking
        const confirmResponse = await fetch('/api/payment/confirm-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmResult = await confirmResponse.json();

        if (confirmResult.success) {
          onPaymentSuccess(confirmResult.bookingId);
        } else {
          throw new Error(confirmResult.message || 'Booking confirmation failed');
        }
      }

    } catch (error) {
      console.error('Payment process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1F2937', // Dark gray/black for better visibility
        backgroundColor: '#ffffff',
        '::placeholder': {
          color: '#6B7280',
        },
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
      complete: {
        color: '#059669',
        iconColor: '#059669',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2 flex items-center">
          <CreditCard className="w-6 h-6 mr-2" />
          Secure Payment
        </h3>
        <p className="text-green-100">Complete your booking with encrypted payment</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Villa:</span>
              <span className="font-medium">{bookingData.villaName}</span>
            </div>
            <div className="flex justify-between">
              <span>Dates:</span>
              <span>{new Date(bookingData.checkIn).toLocaleDateString()} - {new Date(bookingData.checkOut).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Guests:</span>
              <span>{bookingData.guests}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">฿{bookingData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card Input */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Payment Information</h4>
          <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent">
            <CardElement options={cardElementOptions} />
          </div>
          
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{paymentError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We use Stripe for payment processing.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Pay ฿{bookingData.totalAmount.toLocaleString()} Securely
            </>
          )}
        </button>

        {/* Test Card Info */}
        <div className="text-center text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
          <p className="font-medium text-yellow-800 mb-1">Test Mode - Use Test Cards</p>
          <p className="text-yellow-700">Card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits</p>
        </div>
      </form>
    </div>
  );
}

interface StripePaymentProps {
  bookingData: PaymentFormProps['bookingData'];
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function StripePayment({ bookingData, onPaymentSuccess, onPaymentError }: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        bookingData={bookingData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}