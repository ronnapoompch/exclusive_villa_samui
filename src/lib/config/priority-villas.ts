/**
 * Priority Villas Configuration
 * 
 * These villas are prioritized for Channel Manager integration
 * Real names from Excel Column A, Website names from Column B
 * 
 * Website: https://exclusive-villa-samui.vercel.app/
 * Excel Source: C:\Users\ronna\exclusive-villa-samui\data\New EXVLSM Price Listing.xlsx
 */

export const PRIORITY_VILLAS = [
  {
    slug: '5-stars-beachfront-villa',
    websiteName: '5 Stars beachfront Villa',
    realName: '5 House (5BR)',
    id: 'cmh6lasrc00005dmsxogue9l1',
    bedrooms: 5,
    location: 'Maret',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    // Add channel manager IDs here when available
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'alicia-serenity-a3',
    websiteName: 'Alicia Serenity A3',
    realName: 'Ariya Residence A3 (5BR)',
    id: 'cmh6lasrt00035dmsxbolc4nz',
    bedrooms: 5,
    location: 'Maret',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'anzhu-serenity',
    websiteName: 'Anzhu Serenity',
    realName: 'Anzhu Seamate (3BR)',
    id: 'cmh6lasrr00025dmsztl26kvz',
    bedrooms: 3,
    location: 'Lamai',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'kieren-villa-mirage',
    websiteName: 'La Mirage',
    realName: 'La Moon (4BR)',
    id: 'cmh6lasu100215dmsv28p3fpd',
    bedrooms: 3,
    location: 'Plailaem',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null,
    note: 'Excel shows La Moon (4BR) but database has 3 bedrooms - please verify'
  },
  {
    slug: 'kieren-villa-grace',
    websiteName: 'Kieren Villa Grace',
    realName: 'Kerem Villa Gamay (Upper)',
    id: 'cmh6lasu000205dmsklg29r7a',
    bedrooms: 3,
    location: 'Plailaem',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'the-wavora-1-deluxe-sea-view-3br',
    websiteName: 'The Wavora 1 - Deluxe Sea View 3BR',
    realName: 'The Wave 1 - Deluxe Sea View 3BR',
    id: 'cmh6lasxs004t5dms54yn1y0w',
    bedrooms: 3,
    location: 'Chaweng Noi',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'millennial-residence-villa-solara',
    websiteName: 'Millennial Residence Villa Solara',
    realName: 'Miskawaan Residence Villa Sila',
    id: 'cmh6lasuy002l5dms7cjac6lt',
    bedrooms: 7,
    location: 'Maenam',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'the-clay-haven',
    websiteName: 'The Clay Haven',
    realName: 'Tish: Clay Hut (2BR)',
    id: 'cmh6lasyc005a5dmsue0ln4vl',
    bedrooms: 2,
    location: 'Plailaem',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  },
  {
    slug: 'zulu-vista-a1',
    websiteName: 'Zulu Vista A1',
    realName: 'Zog Villas A1 Banana Fan (2BR)',
    id: 'cmh6laszh00655dms1zwibzju',
    bedrooms: 2,
    location: 'Maenam',
    hasAirbnb: false,
    hasAgoda: false,
    hasOfficialWebsite: false,
    channelManagerId: null,
    airbnbListingId: null,
    bookingComPropertyId: null,
    vrboPropertyId: null
  }
] as const;

/**
 * Get priority villa by slug
 */
export function getPriorityVilla(slug: string) {
  return PRIORITY_VILLAS.find(v => v.slug === slug);
}

/**
 * Get priority villa IDs for database queries
 */
export function getPriorityVillaIds(): string[] {
  return PRIORITY_VILLAS.map(v => v.id);
}

/**
 * Check if a villa is in priority list
 */
export function isPriorityVilla(slugOrId: string): boolean {
  return PRIORITY_VILLAS.some(v => v.slug === slugOrId || v.id === slugOrId);
}

/**
 * Get villas by location
 */
export function getPriorityVillasByLocation(location: string) {
  return PRIORITY_VILLAS.filter(v => 
    v.location.toLowerCase() === location.toLowerCase()
  );
}

/**
 * Get villas by bedroom count
 */
export function getPriorityVillasByBedrooms(bedrooms: number) {
  return PRIORITY_VILLAS.filter(v => v.bedrooms === bedrooms);
}

/**
 * Summary stats
 */
export const PRIORITY_VILLA_STATS = {
  total: PRIORITY_VILLAS.length,
  locations: [...new Set(PRIORITY_VILLAS.map(v => v.location))],
  bedroomRange: {
    min: Math.min(...PRIORITY_VILLAS.map(v => v.bedrooms)),
    max: Math.max(...PRIORITY_VILLAS.map(v => v.bedrooms))
  },
  hasAirbnb: PRIORITY_VILLAS.filter(v => v.hasAirbnb).length,
  hasAgoda: PRIORITY_VILLAS.filter(v => v.hasAgoda).length,
  hasOfficialWebsite: PRIORITY_VILLAS.filter(v => v.hasOfficialWebsite).length
};

// For Node.js/CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRIORITY_VILLAS,
    getPriorityVilla,
    getPriorityVillaIds,
    isPriorityVilla,
    getPriorityVillasByLocation,
    getPriorityVillasByBedrooms,
    PRIORITY_VILLA_STATS
  };
}
