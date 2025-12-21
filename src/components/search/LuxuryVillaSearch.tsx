'use client'

import { useState } from 'react'
import { Search, MapPin, Users, Bed, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface SearchFilters {
  location?: string
  bedrooms?: number
  maxGuests?: number
  priceRange?: string
}

interface AdvancedVillaSearchProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function AdvancedVillaSearch({ onSearch, isLoading = false }: AdvancedVillaSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [guests, setGuests] = useState('')
  const [priceRange, setPriceRange] = useState('')

  const handleSearch = () => {
    onSearch({
      location: searchQuery || undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      maxGuests: guests ? parseInt(guests, 10) : undefined,
      priceRange: priceRange || undefined
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
    setBedrooms('')
    setGuests('')
    setPriceRange('')
    onSearch({})
  }

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-amber-300/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-light text-white mb-2">
              Find Your Perfect Villa
            </h2>
            <p className="text-amber-200/70 text-sm">
              Luxury properties in Koh Samui
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-amber-300" />
              <Input
                placeholder="Location or villa name..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-amber-300/30 text-white placeholder-amber-200/50 focus:border-amber-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="bg-slate-800/50 border-amber-300/30 text-white">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-amber-300" />
                    <SelectValue placeholder="Bedrooms" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="bg-slate-800/50 border-amber-300/30 text-white">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-300" />
                    <SelectValue placeholder="Guests" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="4">4 Guests</SelectItem>
                  <SelectItem value="6">6 Guests</SelectItem>
                  <SelectItem value="8">8 Guests</SelectItem>
                  <SelectItem value="10">10+ Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-slate-800/50 border-amber-300/30 text-white">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-300" />
                    <SelectValue placeholder="Price Range" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget (-300/night)</SelectItem>
                  <SelectItem value="mid">Mid-Range (-600/night)</SelectItem>
                  <SelectItem value="luxury">Luxury (-1000/night)</SelectItem>
                  <SelectItem value="ultra">Ultra-Luxury (+/night)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-900 rounded-xl py-3 font-semibold transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search Villas'}
            </Button>
            <Button
              onClick={clearSearch}
              variant="outline"
              className="px-6 bg-transparent border-amber-300/50 text-amber-200 hover:bg-amber-300/10 rounded-xl"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
