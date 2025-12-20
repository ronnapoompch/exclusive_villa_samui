/**
 * Test Airbnb iCal Sync for 5 Stars beachfront Villa
 * Tests fetching and parsing blocked dates from Airbnb calendar
 */

import { fetchICalFeed, filterUpcomingDates, isDateRangeBlocked } from './src/lib/calendar/ical-sync.ts';

const AIRBNB_ICAL_URL = 'https://www.airbnb.com/calendar/ical/967120570910234502.ics?s=4e40e340ff006ece04f5fe02248ebced&locale=zh';
const VILLA_NAME = '5 Stars beachfront Villa';

async function testAirbnbSync() {
  console.log('🏖️  Testing Airbnb Calendar Sync');
  console.log('Villa:', VILLA_NAME);
  console.log('iCal URL:', AIRBNB_ICAL_URL);
  console.log('='.repeat(80));
  console.log('');

  // Fetch and parse iCal feed
  const result = await fetchICalFeed(AIRBNB_ICAL_URL);

  if (!result.success) {
    console.error('❌ Failed to fetch iCal feed');
    if (result.errors) {
      result.errors.forEach(error => console.error('  -', error));
    }
    process.exit(1);
  }

  console.log(`✅ Successfully fetched calendar data`);
  console.log(`📊 Total events: ${result.totalEvents}`);
  console.log(`🚫 Blocked dates: ${result.blockedDates.length}`);
  console.log('');

  if (result.errors && result.errors.length > 0) {
    console.log('⚠️  Warnings:');
    result.errors.forEach(error => console.log('  -', error));
    console.log('');
  }

  // Filter upcoming dates only
  const upcomingBlocked = filterUpcomingDates(result.blockedDates);
  console.log(`📅 Upcoming blocked dates: ${upcomingBlocked.length}`);
  console.log('');

  // Display first 10 upcoming blocked dates
  console.log('📋 Next 10 Blocked Periods:');
  console.log('-'.repeat(80));
  upcomingBlocked.slice(0, 10).forEach((blocked, index) => {
    const start = blocked.startDate.toISOString().split('T')[0];
    const end = blocked.endDate.toISOString().split('T')[0];
    const nights = Math.ceil((blocked.endDate.getTime() - blocked.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`${index + 1}. ${start} → ${end} (${nights} nights)`);
    console.log(`   Summary: ${blocked.summary}`);
    console.log(`   Source: ${blocked.source}`);
    console.log('');
  });

  // Test date availability checks
  console.log('🧪 Testing Date Availability:');
  console.log('-'.repeat(80));

  const testCases = [
    {
      checkIn: new Date('2025-11-01'),
      checkOut: new Date('2025-11-05'),
      description: 'November 1-5, 2025'
    },
    {
      checkIn: new Date('2025-12-20'),
      checkOut: new Date('2025-12-27'),
      description: 'Christmas Week 2025'
    },
    {
      checkIn: new Date('2026-01-01'),
      checkOut: new Date('2026-01-07'),
      description: 'New Year Week 2026'
    }
  ];

  testCases.forEach((test, index) => {
    const blocked = isDateRangeBlocked(test.checkIn, test.checkOut, result.blockedDates);
    const status = blocked ? '❌ BLOCKED' : '✅ AVAILABLE';
    console.log(`${index + 1}. ${test.description}: ${status}`);
  });

  console.log('');
  console.log('='.repeat(80));
  console.log('✅ Test completed successfully!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('  1. Store blocked dates in database (VillaAvailability table)');
  console.log('  2. Create API endpoint to fetch availability for booking form');
  console.log('  3. Update booking form to check availability before submission');
  console.log('  4. Set up cron job to sync calendar daily');
}

// Run test
testAirbnbSync().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
