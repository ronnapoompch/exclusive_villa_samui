'use client'

import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Filter, MapPin, Users, Bed, Wifi, Car, Waves, Utensils, Search, Loader2 } from 'lucide-react'

interface SearchFilters {
  priceRange: [number, number]
  amenities: string[]
  villaType: string[]
  beachAccess: boolean
}

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [rooms, setRooms] = useState('')
  const [guests, setGuests] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 50000],
    amenities: [],
    villaType: [],
    beachAccess: false
  })

  const amenityOptions = [
    { id: 'pool', label: 'Private Pool', icon: Waves },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'kitchen', label: 'Full Kitchen', icon: Utensils },
    { id: 'beachfront', label: 'Beachfront', icon: MapPin },
    { id: 'chef', label: 'Private Chef', icon: Utensils }
  ]

  const villaTypeOptions = [
    'Modern Villa',
    'Traditional Thai',
    'Beach House',
    'Hillside Retreat',
    'Luxury Estate',
    'Boutique Villa'
  ]

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleSearch = async () => {
    if (isLoading) return // Prevent multiple clicks
    
    setIsLoading(true)
    
    // Simulate API call with loading state
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show search results by scrolling to villa section
    const villaSection = document.querySelector('[data-villa-section]')
    if (villaSection) {
      villaSection.scrollIntoView({ behavior: 'smooth' })
    }
    
    // Search logic will be implemented later
    // Debug search params
    if (process.env.NODE_ENV === 'development') {
      console.warn('Search params:', {
        searchQuery,
        dateRange,
        rooms,
        guests,
        filters
      })
    }
    
    // Show success message
    alert(`Searching for villas${searchQuery ? ` matching "${searchQuery}"` : ''} with ${rooms || 'any'} rooms for ${guests || 'any number of'} guests`)
    
    setIsLoading(false)
  }

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 50000],
      amenities: [],
      villaType: [],
      beachAccess: false
    })
  }

  return (
    <div id="search-form" className="space-y-6 relative z-50 pointer-events-auto">
      {/* Main Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-50">
        <div className="lg:col-span-2 relative z-50">
          <Label htmlFor="search" className="text-sm font-medium text-gray-800 mb-2 block">Villa Name or Location</Label>
          <div className="relative">
            <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 transition-all duration-200 pointer-events-none z-10 ${
              searchQuery ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`} />
            <Input 
              id="search" 
              placeholder="    Search villas in Samui..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder:text-gray-500 relative z-20 pointer-events-auto"
            />
          </div>
        </div>
        
        <div className="relative z-50">
          <Label className="text-sm font-medium text-gray-800 mb-2 block">Check-in & Check-out</Label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select dates"
            className="h-12 border-gray-300 focus:border-cyan-500 transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 relative z-30 pointer-events-auto"
          />
        </div>
        
        <div className="relative z-50">
          <Label htmlFor="rooms" className="text-sm font-medium text-gray-800 mb-2 block">Rooms</Label>
          <Select value={rooms} onValueChange={setRooms}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-cyan-500 transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 relative z-30 pointer-events-auto">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Rooms" />
              </div>
            </SelectTrigger>
            <SelectContent className="z-50 pointer-events-auto">
              <SelectItem value="1">1 Room</SelectItem>
              <SelectItem value="2">2 Rooms</SelectItem>
              <SelectItem value="3">3 Rooms</SelectItem>
              <SelectItem value="4">4 Rooms</SelectItem>
              <SelectItem value="5">5+ Rooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col justify-end relative z-50">
          <Button 
            size="lg" 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold h-12 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95 disabled:scale-100 disabled:hover:shadow-none cursor-pointer z-40 pointer-events-auto"
            type="button"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Search Villas
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Secondary Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-50">
        <div className="relative z-50">
          <Label htmlFor="guests" className="text-sm font-medium text-gray-800 mb-2 block">Guests</Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-cyan-500 transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 relative z-30 pointer-events-auto">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Number of guests" />
              </div>
            </SelectTrigger>
            <SelectContent className="z-50 pointer-events-auto">
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
              <SelectItem value="6">6 Guests</SelectItem>
              <SelectItem value="8">8 Guests</SelectItem>
              <SelectItem value="10">10 Guests</SelectItem>
              <SelectItem value="12">12+ Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative z-50">
          <Label className="text-sm font-medium text-gray-800 mb-2 block">Price Range (THB/night)</Label>
          <div className="h-12 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50 pointer-events-auto">
            <span className="text-sm text-gray-800 font-medium">฿{filters.priceRange[0].toLocaleString()} - ฿{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-end relative z-50">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200 group bg-white text-gray-900 relative z-30 pointer-events-auto cursor-pointer"
              >
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-cyan-600 transition-colors" />
                <span className="group-hover:text-cyan-700 transition-colors">Advanced Filters</span>
                {(filters.amenities.length > 0 || filters.villaType.length > 0) && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-cyan-100 text-cyan-700 group-hover:bg-cyan-200">
                    {filters.amenities.length + filters.villaType.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Advanced Search Filters</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium">Price Range (THB per night)</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: [Number(e.target.value), prev.priceRange[1]]
                        }))}
                        className="flex-1"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], Number(e.target.value)]
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <Label className="text-base font-medium">Amenities</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {amenityOptions.map((amenity) => {
                      const Icon = amenity.icon
                      const isSelected = filters.amenities.includes(amenity.id)
                      return (
                        <div
                          key={amenity.id}
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Villa Types */}
                <div>
                  <Label className="text-base font-medium">Villa Type</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {villaTypeOptions.map((type) => {
                      const isSelected = filters.villaType.includes(type)
                      return (
                        <Badge
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${
                            isSelected ? 'bg-cyan-500 hover:bg-cyan-600' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            villaType: isSelected
                              ? prev.villaType.filter(t => t !== type)
                              : [...prev.villaType, type]
                          }))}
                        >
                          {type}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="px-6 hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={handleSearch}
                    className="px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.amenities.length > 0 || filters.villaType.length > 0) && (
        <div className="flex flex-wrap gap-2 p-4 bg-cyan-50/50 rounded-lg border border-cyan-100">
          <span className="text-sm text-gray-700 font-medium">Active filters:</span>
          {filters.amenities.map((amenityId) => {
            const amenity = amenityOptions.find(a => a.id === amenityId)
            return amenity ? (
              <Badge key={amenityId} variant="secondary" className="text-xs bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors">
                {amenity.label}
                <button 
                  className="ml-2 hover:text-red-600 transition-colors"
                  onClick={() => handleAmenityToggle(amenityId)}
                >
                  ×
                </button>
              </Badge>
            ) : null
          })}
          {filters.villaType.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
              {type}
              <button 
                className="ml-2 hover:text-red-600 transition-colors"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  villaType: prev.villaType.filter(t => t !== type)
                }))}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}