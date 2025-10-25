'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { BookingSubmissionData } from '@/types';

// Booking form validation schema
const bookingSchema = z.object({
  checkInDate: z.date({
    required_error: "Please select a check-in date.",
  }),
  checkOutDate: z.date({
    required_error: "Please select a check-out date.",
  }),
  guests: z.number().min(1, "At least 1 guest is required").max(20, "Maximum 20 guests allowed"),
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().min(10, "Valid phone number is required"),
  specialRequests: z.string().optional(),
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
}).refine(data => {
  const daysDiff = differenceInDays(data.checkOutDate, data.checkInDate);
  return daysDiff >= 3; // Minimum 3 days (2 nights)
}, {
  message: "Minimum stay is 3 days (2 nights)",
  path: ["checkOutDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  villaId: string;
  villaTitle: string;
  villaSlug?: string; // Add slug for API calls
  pricePerNight?: number;  // Add villa base price
  maxGuests: number;
  isLoading?: boolean;
  onBookingSubmit?: (bookingData: any) => Promise<void>;
}

export default function BookingForm({
  villaId,
  villaTitle,
  villaSlug,
  pricePerNight = 250, // Default price fallback
  maxGuests,
  isLoading = false,
  onBookingSubmit
}: BookingFormProps) {
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [availability, setAvailability] = useState<any>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [bookedDates, setBookedDates] = useState<string[]>([]); // วันที่ถูกจองแล้ว
  const [locale, setLocale] = useState<string>('en');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 2,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialRequests: '',
    }
  });

  // ดึง locale จาก pathname
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathLocale = pathname.split('/')[1];
      if (['en', 'th', 'zh', 'ru'].includes(pathLocale)) {
        setLocale(pathLocale);
      }
    }
  }, []);

  // ดึงข้อมูลวันที่ถูกจองแล้วตอน mount
  useEffect(() => {
    if (villaSlug && locale) {
      fetchBookedDates();
    }
  }, [villaSlug, locale]);

  // ดึงวันที่ถูกจองจาก database
  const fetchBookedDates = async () => {
    if (!villaSlug) return;

    try {
      const response = await fetch(
        `/api/villas/${villaSlug}/availability`,
        { cache: 'no-store' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.bookedDates) {
          setBookedDates(data.data.bookedDates);
          console.log('✅ Loaded booked dates:', data.data.bookedDates.length, 'days');
        }
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  // const guests = watch('guests'); // Removed unused variable

  // Check availability when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setValue('checkInDate', checkInDate);
      setValue('checkOutDate', checkOutDate);
      checkAvailability();
    }
  }, [checkInDate, checkOutDate, setValue]);

  // Calculate pricing based on length of stay
  const calculatePricing = (nights: number, basePrice: number) => {
    let effectiveRate = basePrice;
    let discountLabel = '';
    
    if (nights >= 30) {
      // Monthly discount (30% off)
      effectiveRate = Math.round(basePrice * 0.70);
      discountLabel = '30% Monthly Discount';
    } else if (nights >= 7) {
      // Weekly discount (15% off)
      effectiveRate = Math.round(basePrice * 0.85);
      discountLabel = '15% Weekly Discount';
    }
    
    const baseTotal = nights * basePrice;
    const discountedTotal = nights * effectiveRate;
    const discountAmount = baseTotal - discountedTotal;
    const serviceFee = Math.round(discountedTotal * 0.05); // 5% service fee
    const cleaningFee = 0; // No cleaning fee (included in nightly rate)
    const taxes = Math.round((discountedTotal + serviceFee) * 0.07); // 7% taxes
    
    return {
      nights,
      basePrice,
      effectiveRate,
      discountLabel,
      baseTotal,
      discountAmount,
      serviceFee,
      cleaningFee,
      taxes,
      totalPrice: discountedTotal + serviceFee + cleaningFee + taxes
    };
  };

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate || !villaSlug) return;

    setIsCheckingAvailability(true);
    setAvailabilityError('');

    try {
      // Calculate days between check-in and check-out
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      // Check minimum stay requirement (3 days = 2 nights)
      if (nights < 2) {
        setAvailabilityError('Minimum stay is 3 days (2 nights)');
        setAvailability(null);
        setIsCheckingAvailability(false);
        return;
      }

      // เช็คกับ database จริง
      const response = await fetch(
        `/api/villas/${villaSlug}/availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkInDate: checkInDate.toISOString(),
            checkOutDate: checkOutDate.toISOString(),
          }),
          cache: 'no-store'
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAvailabilityError(result.error || 'Failed to check availability');
        setAvailability(null);
        setIsCheckingAvailability(false);
        return;
      }

      if (!result.available) {
        setAvailabilityError(
          'Selected dates are not available. Please choose different dates.'
        );
        setAvailability(null);
        setIsCheckingAvailability(false);
        return;
      }
      
      // Calculate pricing with discounts
      const pricing = calculatePricing(nights, pricePerNight);
      
      // Set availability with real data
      setAvailability({
        available: true,
        pricing: pricing,
        checkInDate: result.checkInDate,
        checkOutDate: result.checkOutDate
      });

    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Failed to check availability. Please try again.');
      setAvailability(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!availability) {
      setAvailabilityError('Please check availability first');
      return;
    }

    const bookingData: BookingSubmissionData = {
      villaId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guests,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      pricing: availability.pricing,
      specialRequests: data.specialRequests,
    };

    // Use parent component's onBookingSubmit if provided, otherwise handle internally
    if (onBookingSubmit) {
      await onBookingSubmit(bookingData);
    } else {
      console.log('Booking submitted:', bookingData);
      alert(`Booking submitted for ${villaTitle}! Total: ${availability.pricing.currency} ${availability.pricing.total}`);
    }
  };

  // const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0; // Removed unused variable

  return (
    <>
      <style jsx global>{`
        .rdp-day_booked {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          text-decoration: line-through;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .rdp-day_booked:hover {
          background-color: #fecaca !important;
        }
      `}</style>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Book {villaTitle}</h2>
          <p className="text-blue-100 mt-1">Secure your luxury villa experience</p>
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Check-in Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-colors",
                      !checkInDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg">
                    <h4 className="font-semibold text-sm">Select Check-in Date</h4>
                  </div>
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => {
                        // ห้ามเลือกวันที่ผ่านไปแล้ว
                        if (date < new Date()) return true;
                        
                        // ห้ามเลือกวันที่ถูกจองแล้ว
                        const dateStr = date.toISOString().split('T')[0];
                        return bookedDates.includes(dateStr);
                      }}
                      initialFocus
                      className="rounded-md border-0"
                      modifiers={{
                        booked: (date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return bookedDates.includes(dateStr);
                        }
                      }}
                      modifiersClassNames={{
                        booked: 'bg-red-100 text-red-500 line-through'
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.checkInDate && (
                <p className="text-red-500 text-sm">{errors.checkInDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Check-out Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-colors",
                      !checkOutDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg">
                    <h4 className="font-semibold text-sm">Select Check-out Date</h4>
                  </div>
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => {
                        // ห้ามเลือกวันที่ผ่านไปแล้ว
                        if (date < new Date()) return true;
                        
                        // ห้ามเลือกก่อนหรือเท่ากับวัน check-in
                        if (checkInDate && date <= checkInDate) return true;
                        
                        // ห้ามเลือกวันที่ถูกจองแล้ว
                        const dateStr = date.toISOString().split('T')[0];
                        return bookedDates.includes(dateStr);
                      }}
                      initialFocus
                      className="rounded-md border-0"
                      modifiers={{
                        booked: (date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return bookedDates.includes(dateStr);
                        }
                      }}
                      modifiersClassNames={{
                        booked: 'bg-red-100 text-red-500 line-through'
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.checkOutDate && (
                <p className="text-red-500 text-sm">{errors.checkOutDate.message}</p>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Number of Guests</label>
            <Input
              type="number"
              min="1"
              max={maxGuests}
              {...register('guests', { valueAsNumber: true })}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">Maximum {maxGuests} guests</p>
            {errors.guests && (
              <p className="text-red-500 text-sm">{errors.guests.message}</p>
            )}
          </div>

          {/* Minimum Stay Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-medium text-sm">Minimum Stay Policy</p>
                <p className="text-xs">All bookings require a minimum stay of 3 days (2 nights)</p>
              </div>
            </div>
          </div>

          {/* Availability Check - Only show when dates are selected */}
          {(checkInDate && checkOutDate) && (() => {
            const nights = differenceInDays(checkOutDate, checkInDate);
            return nights > 0 ? (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                {isCheckingAvailability ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Checking availability...</span>
                </div>
              ) : availabilityError ? (
                <div className="text-red-500">
                  <p className="font-medium">Not Available</p>
                  <p className="text-sm">{availabilityError}</p>
                </div>
              ) : availability ? (
                <div className="space-y-3">
                  {/* Pricing Breakdown */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Stay Summary</span>
                      {availability.pricing.discountLabel && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {availability.pricing.discountLabel}
                        </span>
                      )}
                    </div>
                    
                    {/* Original vs Discounted Price */}
                    <div className="space-y-1">
                      {availability.pricing.discountAmount > 0 ? (
                        <>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Base rate ({availability.pricing.nights} nights × ${availability.pricing.basePrice})</span>
                            <span className="line-through">${availability.pricing.baseTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Discounted rate ({availability.pricing.nights} nights × ${availability.pricing.effectiveRate})</span>
                            <span>${(availability.pricing.nights * availability.pricing.effectiveRate).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>You save:</span>
                            <span>-${availability.pricing.discountAmount.toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span>Nightly rate ({availability.pricing.nights} nights × ${availability.pricing.basePrice})</span>
                          <span>${availability.pricing.baseTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Fees Breakdown */}
                  <div className="space-y-1">
                    {availability.pricing.cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Cleaning fee</span>
                        <span>${availability.pricing.cleaningFee.toLocaleString()}</span>
                      </div>
                    )}
                    {availability.pricing.serviceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Service fee (5%)</span>
                        <span>${availability.pricing.serviceFee.toLocaleString()}</span>
                      </div>
                    )}
                    {availability.pricing.taxes > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Taxes (7%)</span>
                        <span>${availability.pricing.taxes.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600 text-xl">${availability.pricing.totalPrice.toLocaleString()}</span>
                    </div>
                    {availability.pricing.discountAmount > 0 && (
                      <p className="text-xs text-green-600 text-right mt-1">
                        Total savings: ${availability.pricing.discountAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            ) : null;
          })()}

          {/* Guest Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-2">Guest Details</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <Input
                {...register('guestName')}
                placeholder="Enter your full name"
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.guestName && (
                <p className="text-red-500 text-sm">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                type="email"
                {...register('guestEmail')}
                placeholder="Enter your email"
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.guestEmail && (
                <p className="text-red-500 text-sm">{errors.guestEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <Input
                {...register('guestPhone')}
                placeholder="Enter your phone number"
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.guestPhone && (
                <p className="text-red-500 text-sm">{errors.guestPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Special Requests (Optional)</label>
              <textarea
                {...register('specialRequests')}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="Any special requirements or requests..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isLoading || !availability || isCheckingAvailability}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Booking...
              </>
            ) : (
              `Book Now - $${availability?.pricing?.totalPrice?.toLocaleString() || '0'}`
            )}
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}