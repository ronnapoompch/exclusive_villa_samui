import { NextResponse } from 'next/server';

// Mock booking data for admin dashboard
const mockBookings = [
  {
    id: 'EVS-1733532123-ABC123',
    villaName: 'Dada Villa Ludwig',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    checkIn: '2025-10-15',
    checkOut: '2025-10-20',
    guests: 4,
    totalAmount: 125000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2025-10-06T10:30:00Z',
    paymentIntentId: 'pi_1234567890abcdef'
  },
  {
    id: 'EVS-1733532456-DEF456',
    villaName: 'Aura Villa Garden (Monthly)',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@example.com',
    checkIn: '2025-10-12',
    checkOut: '2025-10-17',
    guests: 2,
    totalAmount: 85000,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2025-10-06T14:15:00Z',
    paymentIntentId: 'pi_pending123456789'
  },
  {
    id: 'EVS-1733532789-GHI789',
    villaName: 'BannTai estate Beach_ Limocello Villa',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@example.com',
    checkIn: '2025-10-20',
    checkOut: '2025-10-25',
    guests: 6,
    totalAmount: 195000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2025-10-05T16:45:00Z',
    paymentIntentId: 'pi_0987654321fedcba'
  },
  {
    id: 'EVS-1733533012-JKL012',
    villaName: '5House',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.wilson@example.com',
    checkIn: '2025-10-18',
    checkOut: '2025-10-22',
    guests: 3,
    totalAmount: 98000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2025-10-04T09:20:00Z',
    paymentIntentId: 'pi_cancelled456789'
  },
  {
    id: 'EVS-1733533345-MNO345',
    villaName: 'Ariya Residence A3',
    customerName: 'David Rodriguez',
    customerEmail: 'david.rodriguez@example.com',
    checkIn: '2025-10-25',
    checkOut: '2025-10-30',
    guests: 5,
    totalAmount: 165000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2025-10-03T13:10:00Z',
    paymentIntentId: 'pi_confirmed987654'
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';

    // Filter bookings based on search and status
    let filteredBookings = mockBookings;

    if (search) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.villaName.toLowerCase().includes(search.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        booking.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    // Calculate statistics
    const totalBookings = mockBookings.length;
    const totalRevenue = mockBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = mockBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = mockBookings.filter(b => b.status === 'cancelled').length;
    
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const occupancyRate = Math.round((confirmedBookings / totalBookings) * 100);

    return NextResponse.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredBookings.length / limit),
          totalBookings: filteredBookings.length,
          limit
        },
        stats: {
          totalBookings,
          totalRevenue,
          occupancyRate,
          avgBookingValue,
          activeVillas: 210,
          pendingBookings,
          confirmedBookings,
          cancelledBookings
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin bookings API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin data'
    }, { status: 500 });
  }
}
