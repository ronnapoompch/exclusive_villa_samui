'use client'

import { Search, MapPin, Users, Calendar, DollarSign, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

interface AdvancedVillaSearchProps {
  onSearch: (data: SearchFormData) => void
  isLoading?: boolean
}

interface SearchFormData {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  minPrice?: number
  maxPrice?: number
  beachfront?: boolean
  searchQuery?: string
}

// Samui locations from actual villa data
const SAMUI_LOCATIONS = [
  'All Locations',
  'Bang Makham',
  'Bangkhao',
  'Bangpor',
  'Bangrak',
  'Bantai',
  'Bophut',
  'Chaweng',
  'Chaweng Noi',
  'Choengmon',
  'Huathanon',
  'Lamai',
  'Lipa Noi',
  'Maenam',
  'Maret',
  'Plailaem',
  'Taling Ngam'
]

const GUEST_OPTIONS = [
  { value: '2', label: '2 Guests' },
  { value: '4', label: '4 Guests' },
  { value: '6', label: '6 Guests' },
  { value: '8', label: '8 Guests' },
  { value: '10', label: '10 Guests' },
  { value: '12', label: '12 Guests' },
  { value: '15', label: '15+ Guests' },
  { value: '20', label: '20+ Guests' },
]

// Price constants for slider (in thousands)
const MIN_PRICE = 0
const MAX_PRICE = 500
const PRICE_STEP = 10

// Format price for display
const formatPrice = (value: number): string => {
  if (value === 0) return '฿0'
  if (value >= 1000) return `฿${(value / 1000).toFixed(1)}M`
  return `฿${value}K`
}

export function AdvancedVillaSearch({ onSearch, isLoading }: AdvancedVillaSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [priceRange, setPriceRange] = useState<number[]>([MIN_PRICE, MAX_PRICE])
  const [beachfront, setBeachfront] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSearch({
      searchQuery: searchQuery || undefined,
      location: location === 'All Locations' ? undefined : location,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests ? parseInt(guests, 10) : undefined,
      minPrice: priceRange[0] > MIN_PRICE ? priceRange[0] * 1000 : undefined,
      maxPrice: priceRange[1] < MAX_PRICE ? priceRange[1] * 1000 : undefined,
      beachfront: beachfront || undefined,
    })
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Search Query - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="searchQuery" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-gray-500" />
              Search by Villa Name or Description
            </Label>
            <Input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for villa name, description, or keywords..."
              className="h-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Location
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white border border-gray-200 shadow-xl rounded-lg">
                  {SAMUI_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} className="rounded-md">
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in */}
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                Check-in
              </Label>
              <div className="relative">
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  className="h-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 cursor-pointer transition-all"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                Check-out
              </Label>
              <div className="relative">
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  disabled={!checkIn}
                  className="h-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-500" />
                Guests
              </Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-full h-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                  {GUEST_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="rounded-md">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                Price Range
              </Label>
              <div className="h-12 flex items-center justify-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 px-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-amber-700">{formatPrice(priceRange[0])}</span>
                  <span className="text-amber-400">—</span>
                  <span className="text-amber-700">
                    {priceRange[1] >= MAX_PRICE ? '฿500K+' : formatPrice(priceRange[1])}
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <Slider
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Beachfront Checkbox - Full Width */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="beachfront"
              checked={beachfront}
              onChange={(e) => setBeachfront(e.target.checked)}
              className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
            />
            <Label 
              htmlFor="beachfront" 
              className="text-sm font-semibold text-blue-700 flex items-center gap-2 cursor-pointer"
            >
              <Waves className="h-4 w-4 text-blue-600" />
              Beachfront Villas Only
              <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">38 villas</span>
            </Label>
          </div>

          <div className="flex justify-center pt-3">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full sm:w-auto min-w-[240px] h-13 px-10 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Villas
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
