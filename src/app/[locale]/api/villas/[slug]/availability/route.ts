import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string; slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!slug) {
      return NextResponse.json(
        { error: 'Villa slug is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลวิลล่า
    const villa = await prisma.villa.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    // ดึงการจองทั้งหมดที่ active (confirmed, pending)
    const bookings = await prisma.booking.findMany({
      where: {
        villaId: villa.id,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        // ถ้ามี date range filter
        ...(startDate && endDate ? {
          OR: [
            {
              checkIn: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              checkOut: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              AND: [
                {
                  checkIn: {
                    lte: new Date(startDate)
                  }
                },
                {
                  checkOut: {
                    gte: new Date(endDate)
                  }
                }
              ]
            }
          ]
        } : {})
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        guests: true
      },
      orderBy: {
        checkIn: 'asc'
      }
    });

    // แปลงเป็น array ของวันที่ที่ถูกจองแล้ว
    const bookedDates: string[] = [];
    const bookedRanges = bookings.map(booking => ({
      start: booking.checkIn.toISOString(),
      end: booking.checkOut.toISOString(),
      status: booking.status
    }));

    // สร้าง array ของวันที่ทั้งหมดที่ถูกจอง
    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const current = new Date(start);

      while (current <= end) {
        bookedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        villaId: villa.id,
        villaName: villa.name,
        bookedDates: [...new Set(bookedDates)], // Remove duplicates
        bookedRanges,
        totalBookings: bookings.length
      }
    });

  } catch (error) {
    console.error('Error fetching villa availability:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - เช็คว่าช่วงวันที่ต้องการจองว่างไหม
export async function POST(
  request: NextRequest,
  { params }: { params: { locale: string; slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const body = await request.json();
    const { checkInDate, checkOutDate } = body;

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลวิลล่า
    const villa = await prisma.villa.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    // เช็คว่ามีการจองที่ทับซ้อนหรือไม่
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        villaId: villa.id,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        OR: [
          {
            // Booking ที่เริ่มในช่วงที่ต้องการจอง
            checkIn: {
              gte: startDate,
              lt: endDate
            }
          },
          {
            // Booking ที่จบในช่วงที่ต้องการจอง
            checkOut: {
              gt: startDate,
              lte: endDate
            }
          },
          {
            // Booking ที่ครอบคลุมช่วงที่ต้องการจอง
            AND: [
              {
                checkIn: {
                  lte: startDate
                }
              },
              {
                checkOut: {
                  gte: endDate
                }
              }
            ]
          }
        ]
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true
      }
    });

    const isAvailable = conflictingBookings.length === 0;

    return NextResponse.json({
      success: true,
      available: isAvailable,
      checkInDate: startDate.toISOString(),
      checkOutDate: endDate.toISOString(),
      ...(conflictingBookings.length > 0 && {
        conflicts: conflictingBookings.map(b => ({
          start: b.checkIn.toISOString(),
          end: b.checkOut.toISOString(),
          status: b.status
        }))
      })
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
