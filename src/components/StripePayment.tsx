'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Shield, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingData {
  villaId: string;
  villaName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  baseTotal: number;
  discountAmount: number;
  discountLabel: string;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
}

interface PaymentFormProps {
  bookingData: BookingData;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({ bookingData, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'processing' | 'verifying' | 'success'>('input');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setCurrentStep('processing');

    try {
      // Step 1: Create PaymentIntent
      const createResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          villaId: bookingData.villaId,
          villaName: bookingData.villaName,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          nights: bookingData.nights,
          guests: bookingData.guests,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          specialRequests: bookingData.specialRequests,
          baseTotal: bookingData.baseTotal,
          discountAmount: bookingData.discountAmount,
          discountLabel: bookingData.discountLabel,
          serviceFee: bookingData.serviceFee,
          taxes: bookingData.taxes,
          totalPrice: bookingData.totalAmount,
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok || !createResult.success) {
        throw new Error(createResult.error?.message || 'Failed to initialize payment');
      }

      const { clientSecret, paymentIntentId } = createResult.data;

      if (!clientSecret) {
        throw new Error('Invalid payment intent');
      }

      // Step 2: Confirm Card Payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData.guestName,
            email: bookingData.guestEmail,
            phone: bookingData.guestPhone,
          },
        },
      });

      if (error) {
        console.error('❌ Payment failed:', error);
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        setCurrentStep('verifying');
        
        // Poll for booking creation (webhook creates booking)
        const maxAttempts = 10;
        let attempts = 0;
        
        const checkBooking = async (): Promise<string | null> => {
          try {
            const response = await fetch(`/api/bookings/by-payment-intent/${paymentIntent.id}`);
            if (response.ok) {
              const data = await response.json();
              return data.bookingId;
            }
          } catch (error) {
            console.error('Error checking booking:', error);
          }
          return null;
        };

        // Try to get booking ID
        while (attempts < maxAttempts) {
          const bookingId = await checkBooking();
          if (bookingId) {
            setCurrentStep('success');
            // Redirect to confirmation page after 1 second
            setTimeout(() => {
              router.push(`/booking/confirmation/${bookingId}`);
            }, 1000);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          attempts++;
        }

        // If booking not found after 10 seconds, still show success
        // User can check email for booking reference
        setCurrentStep('success');
        onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment not completed');
      }

    } catch (error) {
      console.error('❌ Payment process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
      setCurrentStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1F2937',
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
      {/* Verifying State */}
      {currentStep === 'verifying' && (
        <div className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-100 rounded-full p-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirming Booking...</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we finalize your reservation.
          </p>
          <div className="text-sm text-gray-500">
            This may take a few seconds...
          </div>
        </div>
      )}

      {/* Success State */}
      {currentStep === 'success' && (
        <div className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your booking has been confirmed and you'll receive an email shortly.
          </p>
          <div className="inline-flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to confirmation...
          </div>
        </div>
      )}

      {/* Payment Form */}
      {currentStep !== 'success' && currentStep !== 'verifying' && (
        <>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Secure Payment
            </h3>
            <p className="text-purple-100">Complete your booking with encrypted payment</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">✓</span>
                Booking Summary
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Villa:</span>
                  <span className="font-medium text-gray-900">{bookingData.villaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="text-gray-900">{new Date(bookingData.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="text-gray-900">{new Date(bookingData.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900">{bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="text-gray-900">{bookingData.guests} {bookingData.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name:</span>
                  <span className="text-gray-900">{bookingData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{bookingData.guestEmail}</span>
                </div>
                
                {/* Price Breakdown */}
                <div className="border-t border-blue-200 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Base Rate ({bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'})</span>
                    <span>฿{bookingData.baseTotal.toLocaleString()}</span>
                  </div>
                  
                  {bookingData.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{bookingData.discountLabel}</span>
                      <span>-฿{bookingData.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Service Fee</span>
                    <span>฿{bookingData.serviceFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Taxes (5%)</span>
                    <span>฿{bookingData.taxes.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">Total Amount:</span>
                    <span className="font-bold text-2xl text-blue-600">฿{bookingData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Input */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Payment Information
              </h4>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                <CardElement options={cardElementOptions} />
              </div>
              
              {paymentError && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    <span className="text-red-800 text-sm">{paymentError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">🔒 Secure Payment Guarantee</p>
                  <p className="text-green-700">
                    Your payment is encrypted with 256-bit SSL. We use Stripe for secure processing. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripe || isProcessing || currentStep === 'processing'}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isProcessing || currentStep === 'processing' ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Processing Secure Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Pay ฿{bookingData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Now
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By completing this payment, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>

            {/* Test Card Info - Only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center text-xs bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-1">🧪 TEST MODE - Use Test Cards</p>
                <p className="text-yellow-800">
                  Success: <code className="bg-yellow-100 px-1 rounded">4242 4242 4242 4242</code> | 
                  Decline: <code className="bg-yellow-100 px-1 rounded">4000 0000 0000 0002</code>
                </p>
                <p className="text-yellow-700 mt-1">Any future expiry date | Any 3-digit CVC</p>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}

interface StripePaymentProps {
  bookingData: BookingData;
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