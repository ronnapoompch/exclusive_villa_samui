/**
 * iCal Sync Utility for Airbnb Calendar Integration
 * Fetches and parses iCal feeds from Airbnb to sync blocked/booked dates
 */

import ical from 'node-ical';

export interface BlockedDate {
  startDate: Date;
  endDate: Date;
  summary: string;
  source: 'airbnb' | 'booking' | 'agoda' | 'direct';
  externalId?: string;
}

export interface CalendarSyncResult {
  success: boolean;
  blockedDates: BlockedDate[];
  totalEvents: number;
  errors?: string[];
}

/**
 * Fetch and parse iCal feed from URL
 */
export async function fetchICalFeed(icalUrl: string): Promise<CalendarSyncResult> {
  try {
    console.log('📅 Fetching iCal feed from:', icalUrl);
    
    // Fetch iCal data
    const events = await ical.async.fromURL(icalUrl);
    
    const blockedDates: BlockedDate[] = [];
    const errors: string[] = [];
    let totalEvents = 0;

    // Parse events
    for (const key in events) {
      const event = events[key];
      
      // Only process VEVENT type (calendar events)
      if (event.type === 'VEVENT') {
        totalEvents++;
        
        try {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          // Validate dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push(`Invalid dates for event: ${event.summary}`);
            continue;
          }
          
          blockedDates.push({
            startDate,
            endDate,
            summary: event.summary || 'Blocked',
            source: determineSource(icalUrl, event.summary),
            externalId: event.uid
          });
          
        } catch (error) {
          errors.push(`Error parsing event: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    console.log(`✅ Parsed ${blockedDates.length} blocked dates from ${totalEvents} events`);
    
    return {
      success: true,
      blockedDates,
      totalEvents,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    console.error('❌ Error fetching iCal feed:', error);
    return {
      success: false,
      blockedDates: [],
      totalEvents: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Determine source platform from URL or event summary
 */
function determineSource(url: string, summary?: string): 'airbnb' | 'booking' | 'agoda' | 'direct' {
  const urlLower = url.toLowerCase();
  const summaryLower = (summary || '').toLowerCase();
  
  if (urlLower.includes('airbnb') || summaryLower.includes('airbnb')) {
    return 'airbnb';
  }
  if (urlLower.includes('booking') || summaryLower.includes('booking')) {
    return 'booking';
  }
  if (urlLower.includes('agoda') || summaryLower.includes('agoda')) {
    return 'agoda';
  }
  
  return 'direct';
}

/**
 * Filter out past dates and sort by start date
 */
export function filterUpcomingDates(blockedDates: BlockedDate[]): BlockedDate[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return blockedDates
    .filter(date => date.endDate >= today)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Check if a date range is blocked
 */
export function isDateRangeBlocked(
  checkIn: Date,
  checkOut: Date,
  blockedDates: BlockedDate[]
): boolean {
  return blockedDates.some(blocked => {
    // Check if there's any overlap between the date ranges
    return (
      (checkIn >= blocked.startDate && checkIn < blocked.endDate) || // Check-in falls in blocked period
      (checkOut > blocked.startDate && checkOut <= blocked.endDate) || // Check-out falls in blocked period
      (checkIn <= blocked.startDate && checkOut >= blocked.endDate)    // Requested period encompasses blocked period
    );
  });
}

/**
 * Get blocked date ranges for a specific month
 */
export function getBlockedDatesForMonth(
  year: number,
  month: number, // 0-11 (January = 0)
  blockedDates: BlockedDate[]
): BlockedDate[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  
  return blockedDates.filter(blocked => {
    // Check if blocked period overlaps with the requested month
    return blocked.startDate <= monthEnd && blocked.endDate >= monthStart;
  });
}
