'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Calendar, 
  Users, 
  Mail, 
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const StripePayment = dynamic(() => import('./StripePayment'), { ssr: false });

interface Villa {
  id: string;
  name: string;
  slug: string;
  pricing: {
    dailyRate?: string;
    weeklyRate?: string;
    monthlyRate?: string;
    currency: string;
  };
  maxGuests: number;
}

interface BookingFormProps {
  villa: Villa;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface PricingData {
  pricing: {
    pricePerNight: number;
    totalNights: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
    breakdown: Array<{
      date: string;
      price: number;
      seasonName: string;
    }>;
  };
  requirements: {
    minStay: number;
    maxStay: number;
    maxGuests: number;
  };
  warnings: string[];
}

export default function BookingForm({ villa }: BookingFormProps) {
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: '',
    checkOut: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [bookingStatus, setBookingStatus] = useState<'idle' | 'payment' | 'success' | 'error'>('idle');
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  
  // New state for real-time checks
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Check availability and pricing when dates change
  const checkAvailabilityAndPricing = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setIsAvailable(null);
      setPricingData(null);
      setAvailabilityError(null);
      return;
    }

    setIsCheckingAvailability(true);
    setAvailabilityError(null);

    try {
      // Check availability first
      const availabilityResponse = await fetch(`/api/villas/${villa.slug}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut
        })
      });

      const availabilityResult = await availabilityResponse.json();

      if (!availabilityResult.available) {
        setIsAvailable(false);
        setPricingData(null);
        setAvailabilityError(availabilityResult.reason || 'Dates not available');
        setIsCheckingAvailability(false);
        return;
      }

      setIsAvailable(true);

      // Get pricing
      const pricingResponse = await fetch(`/api/villas/${villa.slug}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests
        })
      });

      if (!pricingResponse.ok) {
        throw new Error('Pricing not available for selected dates');
      }

      const pricingResult = await pricingResponse.json();
      setPricingData(pricingResult);

    } catch (error) {
      console.error('Availability/Pricing check error:', error);
      setAvailabilityError('Unable to check availability. Please try again.');
      setIsAvailable(null);
      setPricingData(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, dayDiff);
  };

  // Calculate total price
  const calculateTotal = () => {
    // Use real-time pricing if available
    if (pricingData) {
      return pricingData.pricing.total;
    }
    
    // Fallback to basic calculation
    const nights = calculateNights();
    if (!nights || !villa.pricing.dailyRate) return 0;
    return nights * parseInt(villa.pricing.dailyRate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.firstName || 
        !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (calculateNights() < 1 || calculateTotal() <= 0) {
      alert('Please select valid dates');
      return;
    }

    // Check availability before proceeding
    if (isAvailable === false) {
      alert('Selected dates are not available. Please choose different dates.');
      return;
    }

    // Check minimum stay requirement
    if (pricingData?.warnings && pricingData.warnings.length > 0) {
      const confirmed = confirm(
        `${pricingData.warnings.join('\n')}\n\nDo you want to proceed anyway?`
      );
      if (!confirmed) return;
    }

    // Proceed to payment
    setBookingStatus('payment');
  };

  const handlePaymentSuccess = (bookingId: string) => {
    setCompletedBookingId(bookingId);
    setBookingStatus('success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setBookingStatus('error');
  };

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));

    // Trigger availability check when dates change
    if (field === 'checkIn' || field === 'checkOut') {
      // Use setTimeout to debounce and wait for state update
      setTimeout(() => checkAvailabilityAndPricing(), 100);
    }
  };

  const nights = calculateNights();
  const totalAmount = calculateTotal();

  // Payment Step
  if (bookingStatus === 'payment') {
    // Calculate price breakdown
    const baseTotal = pricingData?.pricing.totalNights || (nights * parseInt(villa.pricing.dailyRate || '0'));
    const cleaningFee = pricingData?.pricing.cleaningFee || 0;
    const serviceFee = pricingData?.pricing.serviceFee || (baseTotal * 0.05);
    const taxes = (baseTotal + cleaningFee + serviceFee) * 0.05;
    
    // Apply discounts
    let discount = 0;
    let discountLabel = '';
    if (nights >= 30) {
      discount = baseTotal * 0.30;
      discountLabel = 'Monthly discount (30%)';
    } else if (nights >= 7) {
      discount = baseTotal * 0.15;
      discountLabel = 'Weekly discount (15%)';
    }
    
    const finalTotal = baseTotal - discount + cleaningFee + serviceFee + taxes;

    // Convert date strings to ISO datetime format (required by API)
    const checkInISO = new Date(bookingData.checkIn + 'T00:00:00.000Z').toISOString();
    const checkOutISO = new Date(bookingData.checkOut + 'T00:00:00.000Z').toISOString();

    const paymentBookingData = {
      villaId: villa.id,
      villaName: villa.name,
      checkInDate: checkInISO,
      checkOutDate: checkOutISO,
      nights: nights,
      guests: bookingData.guests,
      guestName: `${bookingData.firstName} ${bookingData.lastName}`,
      guestEmail: bookingData.email,
      guestPhone: bookingData.phone,
      specialRequests: bookingData.specialRequests,
      baseTotal: Math.round(baseTotal),
      discountAmount: Math.round(discount),
      discountLabel: discountLabel,
      serviceFee: Math.round(serviceFee),
      taxes: Math.round(taxes),
      totalAmount: Math.round(finalTotal)
    };

    return (
      <StripePayment 
        bookingData={paymentBookingData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    );
  }

  // Success Step
  if (bookingStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h3>
          <p className="text-gray-600 mb-2">
            Your booking for {villa.name} has been confirmed and paid.
          </p>
          {completedBookingId && (
            <p className="text-sm text-gray-500 mb-6">
              Booking ID: <span className="font-mono font-semibold">{completedBookingId}</span>
            </p>
          )}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-semibold">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-semibold">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span className="font-semibold">{bookingData.guests}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Paid:</span>
                <span className="font-bold text-lg text-green-600">฿{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 text-sm text-gray-600 mb-6">
            <p>📧 A confirmation email has been sent to {bookingData.email}</p>
            <p>📱 We&apos;ll contact you 24 hours before check-in with details</p>
            <p>🏖️ Get ready for an amazing stay at {villa.name}!</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors"
          >
            Explore More Villas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Book Your Stay</h2>
        <p className="text-cyan-100">Secure your reservation at {villa.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Dates Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-cyan-600" />
            Select Dates
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                required
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                value={bookingData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="space-y-2">
              <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-600" />
                  <span className="text-cyan-700 font-medium">
                    {nights} night{nights > 1 ? 's' : ''} stay
                  </span>
                </div>
              </div>

              {/* Availability Check Status */}
              {isCheckingAvailability && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-700 text-sm">
                      Checking availability and pricing...
                    </span>
                  </div>
                </div>
              )}

              {/* Available */}
              {!isCheckingAvailability && isAvailable === true && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-700 font-medium">
                      Dates available!
                    </span>
                  </div>
                </div>
              )}

              {/* Not Available */}
              {!isCheckingAvailability && isAvailable === false && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                    <span className="text-red-700 font-medium">
                      {availabilityError || 'Dates not available'}
                    </span>
                  </div>
                </div>
              )}

              {/* Pricing Warnings */}
              {pricingData?.warnings && pricingData.warnings.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-700 text-sm">
                      {pricingData.warnings.map((warning, idx) => (
                        <div key={idx}>{warning}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guests Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-cyan-600" />
            Guests
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests (Max: {villa.maxGuests})
            </label>
            <select
              required
              value={bookingData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
            >
              {[...Array(villa.maxGuests)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guest Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-cyan-600" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={bookingData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={bookingData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={bookingData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={bookingData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Special Requests (Optional)
          </h3>
          
          <div>
            <textarea
              value={bookingData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              placeholder="Any special requests or requirements..."
            />
          </div>
        </div>

        {/* Price Summary */}
        {nights > 0 && totalAmount > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Booking Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              {pricingData ? (
                <>
                  <div className="flex justify-between">
                    <span>฿{pricingData.pricing.pricePerNight.toLocaleString()} × {nights} nights</span>
                    <span>฿{pricingData.pricing.totalNights.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Cleaning Fee</span>
                    <span>฿{pricingData.pricing.cleaningFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee (5%)</span>
                    <span>฿{pricingData.pricing.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount</span>
                    <span>฿{pricingData.pricing.total.toLocaleString()}</span>
                  </div>
                  
                  {/* Season Breakdown */}
                  {pricingData.pricing.breakdown.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        View daily breakdown
                      </summary>
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        {pricingData.pricing.breakdown.map((day, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{new Date(day.date).toLocaleDateString()} - {day.seasonName}</span>
                            <span>฿{day.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>฿{parseInt(villa.pricing.dailyRate || '0').toLocaleString()} × {nights} nights</span>
                    <span>฿{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount</span>
                    <span>฿{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Final price will be calculated based on seasonal rates
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {bookingStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">
                There was an error submitting your booking. Please try again.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!nights || !totalAmount || isCheckingAvailability || isAvailable === false}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isCheckingAvailability ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Checking Availability...
            </>
          ) : isAvailable === false ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Dates Not Available
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment - ฿{totalAmount.toLocaleString()}
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="text-center text-xs text-gray-500">
          <Shield className="w-4 h-4 inline mr-1" />
          Your information is secure and protected
        </div>
      </form>
    </div>
  );
}