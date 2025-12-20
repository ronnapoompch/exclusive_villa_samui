import { NextResponse } from 'next/server';
import ical from 'node-ical';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Vercel Cron Job: Sync Availability from Airbnb Calendar
 * Runs every 6 hours: 0 (star)/6 (star) (star) (star) (star)
 * 
 * Protects endpoint with CRON_SECRET for security
 */

// Priority villas with iCal URLs
const PRIORITY_VILLAS = [
  {
    name: '5 Stars beachfront Villa',
    slug: '5-stars-beachfront-villa',
    villaId: 'cmh6lasrc00005dmsxogue9l1',
    icalUrl: 'https://www.airbnb.com/calendar/ical/1077922953579326858.ics?s=f3e10aa3f5bc0b8e7502e21bbec5fed2',
    enabled: true
  },
  {
    name: 'Alicia Serenity A3',
    slug: 'alicia-serenity-a3',
    villaId: 'cmh6lasrt00035dmsxbolc4nz',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'Anzhu Serenity',
    slug: 'anzhu-serenity',
    villaId: 'cmh6lasrr00025dmsztl26kvz',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'La Mirage (La Moon)',
    slug: 'kieren-villa-mirage',
    villaId: 'cmh6lasu100215dmsv28p3fpd',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'Kieren Villa Grace',
    slug: 'kieren-villa-grace',
    villaId: 'cmh6lasu000205dmsklg29r7a',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'The Wavora 1 (The Wave)',
    slug: 'the-wavora-1-deluxe-sea-view-3br',
    villaId: 'cmh6lasxs004t5dms54yn1y0w',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'Villa Solara (Miskawaan)',
    slug: 'millennial-residence-villa-solara',
    villaId: 'cmh6lasuy002l5dms7cjac6lt',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'The Clay Haven (Tish)',
    slug: 'the-clay-haven',
    villaId: 'cmh6lasyc005a5dmsue0ln4vl',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  },
  {
    name: 'Zulu Vista A1 (Zog)',
    slug: 'zulu-vista-a1',
    villaId: 'cmh6laszh00655dms1zwibzju',
    icalUrl: '', // TODO: Get from owner
    enabled: false
  }
];

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting availability sync:', new Date().toISOString());

    const results = {
      timestamp: new Date().toISOString(),
      totalVillas: PRIORITY_VILLAS.length,
      processed: 0,
      synced: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    // Process each villa
    for (const villa of PRIORITY_VILLAS) {
      if (!villa.enabled || !villa.icalUrl) {
        results.skipped++;
        results.details.push({
          villa: villa.name,
          status: 'skipped',
          reason: !villa.enabled ? 'Disabled' : 'No iCal URL'
        });
        continue;
      }

      try {
        results.processed++;

        // Fetch and parse iCal
        const events = await ical.async.fromURL(villa.icalUrl);
        
        let eventsProcessed = 0;
        let blockedPeriodsCreated = 0;

        for (const event of Object.values(events)) {
          if (event.type !== 'VEVENT') continue;

          const summary = event.summary || '';
          
          // Check if it's a blocked/booked period
          const isBlocked = 
            summary.includes('Reserved') ||
            summary.includes('Blocked') ||
            summary.includes('Not available') ||
            summary.toLowerCase().includes('airbnb');

          if (!isBlocked) continue;

          eventsProcessed++;

          const startDate = new Date(event.start);
          const endDate = new Date(event.end);

          // Skip past dates
          if (endDate < new Date()) continue;

          // Check if already exists
          const existing = await prisma.blockedDate.findFirst({
            where: {
              villaId: villa.villaId,
              source: 'airbnb',
              externalId: event.uid,
            }
          });

          if (!existing) {
            await prisma.blockedDate.create({
              data: {
                villaId: villa.villaId,
                startDate,
                endDate,
                reason: summary,
                source: 'airbnb',
                externalId: event.uid
              }
            });
            blockedPeriodsCreated++;
          }
        }

        results.synced++;
        results.details.push({
          villa: villa.name,
          status: 'success',
          eventsProcessed,
          blockedPeriodsCreated
        });

      } catch (error: any) {
        results.errors++;
        results.details.push({
          villa: villa.name,
          status: 'error',
          error: error.message
        });
        console.error(`[CRON] Error syncing ${villa.name}:`, error);
      }
    }

    console.log('[CRON] Sync completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Availability sync completed',
      results
    });

  } catch (error: any) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
