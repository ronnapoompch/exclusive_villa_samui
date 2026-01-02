import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  Download,
  Printer,
  Home,
  CreditCard
} from 'lucide-react';

interface BookingConfirmationPageProps {
  params: {
    bookingId: string;
  };
}

async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        villa: {
          include: {
            villaImages: {
              where: { isHero: true },
              take: 1,
            },
          },
        },
        payment: true,
      },
    });

    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: BookingConfirmationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const booking = await getBookingDetails(resolvedParams.bookingId);

  if (!booking) {
    return {
      title: 'Booking Not Found | Exclusive Villa Samui',
    };
  }

  return {
    title: `Booking Confirmed - ${booking.villa.name} | Exclusive Villa Samui`,
    description: `Your booking at ${booking.villa.name} has been confirmed.`,
  };
}

export default async function BookingConfirmationPage({ 
  params 
}: BookingConfirmationPageProps) {
  const resolvedParams = await params;
  const booking = await getBookingDetails(resolvedParams.bookingId);

  if (!booking) {
    notFound();
  }

  const checkInDate = format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy');
  const checkOutDate = format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy');
  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  const heroImage = booking.villa.villaImages?.[0]?.url || 
    (Array.isArray(booking.villa.images) && booking.villa.images.length > 0 ? String(booking.villa.images[0]) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50/30">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            {/* Success Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                <CheckCircle className="relative w-20 h-20 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your booking. We've sent a confirmation email to{' '}
              <span className="font-semibold text-gray-900">{booking.guestEmail}</span>
            </p>
            
            {/* Booking Reference */}
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg px-6 py-3">
              <span className="text-sm text-gray-600 mr-3">Booking Reference:</span>
              <span className="text-2xl font-mono font-bold text-cyan-700">
                {booking.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Villa Information */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {heroImage && (
                <div className="relative h-64 bg-gray-200">
                  <img
                    src={heroImage}
                    alt={booking.villa.name}
                    className="w-full h-full object-cover"
                  />
                  {booking.villa.beachfront && (
                    <div className="absolute top-4 right-4 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      🏖️ Beachfront
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {booking.villa.name}
                </h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{booking.villa.location}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {booking.villa.bedrooms}
                    </div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {booking.villa.bathrooms}
                    </div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {booking.villa.maxGuests}
                    </div>
                    <div className="text-sm text-gray-600">Max Guests</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-cyan-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Check-in</div>
                    <div className="font-semibold text-gray-900">{checkInDate}</div>
                    <div className="text-sm text-gray-500">After 2:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-cyan-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Check-out</div>
                    <div className="font-semibold text-gray-900">{checkOutDate}</div>
                    <div className="text-sm text-gray-500">Before 11:00 AM</div>
                  </div>
                </div>

                <div className="flex items-center pt-4 border-t border-gray-100">
                  <Users className="w-5 h-5 text-cyan-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Guests</div>
                    <div className="font-semibold text-gray-900">
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-600">Total Nights</div>
                    <div className="font-semibold text-gray-900">{nights}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-semibold text-gray-900">{booking.guestName}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold text-gray-900">{booking.guestEmail}</div>
                  </div>
                </div>

                {booking.guestPhone && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Phone className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-semibold text-gray-900">{booking.guestPhone}</div>
                    </div>
                  </div>
                )}

                {booking.specialRequests && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                    <div className="text-gray-900 bg-gray-50 rounded-lg p-3">
                      {booking.specialRequests}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    ✓ Paid
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Currency:</span>
                  <span className="font-semibold text-gray-900">{booking.currency}</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ฿{booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {booking.payment && booking.payment.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Transaction ID: {booking.payment[0].transactionId?.slice(-12)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Paid on: {format(new Date(booking.payment[0].processedAt!), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print Confirmation
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 transition-all duration-200"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Receipt
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-cyan-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our team is here to assist you with any questions about your booking.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-cyan-600" />
                  <a href="mailto:bookings@exclusive-villa-samui.com" className="hover:text-cyan-600">
                    bookings@exclusive-villa-samui.com
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-cyan-600" />
                  <a href="tel:+66123456789" className="hover:text-cyan-600">
                    +66 12 345 6789
                  </a>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <Link
              href="/"
              className="block w-full text-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 transition-all duration-200"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Please arrive at the villa after 2:00 PM on your check-in date</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Check-out is before 11:00 AM on your departure date</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Please bring a valid ID for check-in verification</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Contact us at least 24 hours in advance for any special arrangements</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Cancellation policy applies - please review your booking terms</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            visibility: visible;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
