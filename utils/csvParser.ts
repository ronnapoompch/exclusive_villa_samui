import fs from 'fs';
import path from 'path';

export interface VillaCSVRow {
  Name: string;
  Beachfront: string;
  Bedroom: string;
  'Tel.': string;
  'Official Website': string;
  'Airbnb / Agoda': string;
  'Location Link': string;
  Location: string;
  JANUARY: string;
  FEBRUARY: string;
  MARCH: string;
  APRIL: string;
  MAY: string;
  JUNE: string;
  JULY: string;
  AUGUST: string;
  SEPTEMBER: string;
  OCTOBER: string;
  NOVEMBER: string;
  DECEMBER: string;
  Monthly: string;
  'Name2': string; // Second name column in CSV
  Montly: string;
  Minimum: string;
  'Pet Friendly': string;
  Cleaning: string;
  Cook: string;
  'Elec/Water Bills': string;
}

export interface ParsedVilla {
  name: string;
  slug: string;
  bedrooms: number;
  beachfront: boolean;
  location: string;
  locationLink?: string;
  phone?: string;
  officialWebsite?: string;
  airbnbUrl?: string;
  agodaUrl?: string;
  minimumStay?: string;
  petFriendly: boolean;
  cleaning?: string;
  cook?: string;
  utilities?: string;
  monthlyPricing: MonthlyPricing[];
}

export interface MonthlyPricing {
  month: number;
  dailyRate?: number;
  monthlyRate?: number;
}

export function parseCSV(filePath: string): VillaCSVRow[] {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) return [];
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const rows: VillaCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing - handle quoted strings with commas
    const values = parseCSVLine(line);
    
    if (values.length >= headers.length - 5) { // Allow for some missing columns
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row as VillaCSVRow);
    }
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parsePrice(priceStr: string): number | undefined {
  if (!priceStr || priceStr === '') return undefined;
  
  // Handle price ranges (take the first/lower price)
  const rangeMatch = priceStr.match(/(\d+)[\s\-K,]*[\-–][\s\-K,]*(\d+)/);
  if (rangeMatch) {
    priceStr = rangeMatch[1] + 'K';
  }
  
  // Remove common price formatting and convert K to thousands
  const cleaned = priceStr
    .replace(/[,\s]/g, '')
    .replace(/THB|USD|EUR|GBP/gi, '')
    .replace(/[^\dKk\.]/g, '');
    
  // Handle K suffix (thousands)
  if (cleaned.toLowerCase().includes('k')) {
    const number = parseFloat(cleaned.replace(/k/gi, ''));
    return isNaN(number) ? undefined : Math.round(number * 1000);
  }
  
  // Handle regular numbers
  const num = parseInt(cleaned);
  return isNaN(num) ? undefined : num;
}

export function parseMonthlyPricing(row: VillaCSVRow): MonthlyPricing[] {
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  
  const pricing: MonthlyPricing[] = [];
  
  months.forEach((month, index) => {
    const priceStr = row[month as keyof VillaCSVRow];
    const dailyRate = parsePrice(priceStr as string);
    
    if (dailyRate) {
      pricing.push({
        month: index + 1,
        dailyRate
      });
    }
  });
  
  // Add monthly rate if available
  const monthlyRate = parsePrice(row.Monthly);
  if (monthlyRate && pricing.length > 0) {
    pricing.forEach(p => p.monthlyRate = monthlyRate);
  }
  
  return pricing;
}

export function parseVillaData(filePath: string): ParsedVilla[] {
  const csvRows = parseCSV(filePath);
  
  return csvRows.map(row => {
    // Extract bedroom count
    let bedrooms = 1;
    const bedroomStr = row.Bedroom;
    if (bedroomStr) {
      const match = bedroomStr.match(/(\d+)/);
      bedrooms = match ? parseInt(match[1]) : 1;
    }
    
    // Parse URLs
    const websiteUrls = row['Airbnb / Agoda'] || '';
    const airbnbMatch = websiteUrls.match(/(https?:\/\/[^,\s]*airbnb[^,\s]*)/i);
    const agodaMatch = websiteUrls.match(/(https?:\/\/[^,\s]*agoda[^,\s]*)/i);
    
    return {
      name: row.Name || 'Unnamed Villa',
      slug: createSlug(row.Name || `villa-${Date.now()}`),
      bedrooms,
      beachfront: row.Beachfront === '*',
      location: row.Location || 'Koh Samui',
      locationLink: row['Location Link'] || undefined,
      phone: row['Tel.'] || undefined,
      officialWebsite: row['Official Website'] || undefined,
      airbnbUrl: airbnbMatch ? airbnbMatch[1] : undefined,
      agodaUrl: agodaMatch ? agodaMatch[1] : undefined,
      minimumStay: row.Minimum || undefined,
      petFriendly: row['Pet Friendly']?.toLowerCase() === 'yes' || 
                   row['Pet Friendly']?.toLowerCase() === 'true',
      cleaning: row.Cleaning || undefined,
      cook: row.Cook || undefined,
      utilities: row['Elec/Water Bills'] || undefined,
      monthlyPricing: parseMonthlyPricing(row)
    };
  }).filter(villa => villa.name && villa.name !== 'Unnamed Villa');
}

// Usage example:
// const villas = parseVillaData('./data/villa_data.csv');
// console.log(`Parsed ${villas.length} villas`);