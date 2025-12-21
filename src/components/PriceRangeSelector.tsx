'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ChevronDown, X, TrendingUp, Home, Crown, Gem } from 'lucide-react';

interface PriceRangeSelectorProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
  className?: string;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
}

const PRICE_RANGES: PriceRange[] = [
  {
    id: 'budget',
    label: 'Budget Villa',
    min: 0,
    max: 15000,
    icon: Home,
    popular: true
  },
  {
    id: 'mid-range',
    label: 'Mid-Range',
    min: 15000,
    max: 35000,
    icon: TrendingUp,
    popular: true
  },
  {
    id: 'luxury',
    label: 'Luxury Villa',
    min: 35000,
    max: 75000,
    icon: Crown,
    popular: true
  },
  {
    id: 'ultra-luxury',
    label: 'Ultra Luxury',
    min: 75000,
    max: 200000,
    icon: Gem
  },
  {
    id: 'premium',
    label: 'Premium Villa',
    min: 200000,
    max: 500000,
    icon: Crown
  },
  {
    id: 'exclusive',
    label: 'Exclusive',
    min: 500000,
    max: 1000000,
    icon: Gem
  }
];

export default function PriceRangeSelector({
  value,
  onChange,
  className = ''
}: PriceRangeSelectorProps) {
  const [customMin, setCustomMin] = useState<string>(value[0]?.toString() || '');
  const [customMax, setCustomMax] = useState<string>(value[1]?.toString() || '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'slider' | 'custom'>('presets');

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Any';
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M THB`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}k THB`;
    return `${price.toLocaleString()} THB`;
  };

  const getDisplayText = (): string => {
    const [min, max] = value;
    
    // Check if current value matches any preset
    const matchingPreset = PRICE_RANGES.find(
      range => range.min === min && range.max === max
    );
    
    if (matchingPreset) {
      return matchingPreset.label;
    }
    
    if (min === 0 && max >= 1000000) {
      return 'Any Price';
    }
    
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handlePresetSelect = (range: PriceRange) => {
    onChange([range.min, range.max]);
    setIsOpen(false);
  };

  const handleSliderChange = (type: 'min' | 'max', newValue: number) => {
    if (type === 'min') {
      onChange([Math.min(newValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0])]);
    }
  };

  const handleCustomApply = () => {
    const min = parseInt(customMin) || 0;
    const max = parseInt(customMax) || 1000000;
    onChange([Math.min(min, max), Math.max(min, max)]);
    setIsOpen(false);
  };

  const clearFilter = () => {
    onChange([0, 1000000]);
  };

  const isFiltered = value[0] > 0 || value[1] < 1000000;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-semibold text-gray-800 flex items-center justify-between">
        Price Range (THB/night)
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-12 border-2 border-gray-200 hover:border-cyan-400 focus:border-cyan-500 rounded-xl bg-white/80 backdrop-blur-sm"
          >
            <span className="text-sm font-medium">{getDisplayText()}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-4">
                {[
                  { id: 'presets' as const, label: 'Quick Select' },
                  { id: 'slider' as const, label: 'Range Slider' },
                  { id: 'custom' as const, label: 'Custom' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Preset Ranges */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Popular Ranges
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {PRICE_RANGES.filter(range => range.popular).map(range => {
                        const Icon = range.icon;
                        const isSelected = value[0] === range.min && value[1] === range.max;
                        
                        return (
                          <Button
                            key={range.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`justify-start h-auto py-3 ${
                              isSelected 
                                ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-500' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handlePresetSelect(range)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <div className="flex-1 text-left">
                                <div className="font-medium">{range.label}</div>
                                <div className={`text-xs ${
                                  isSelected ? 'text-cyan-100' : 'text-gray-500'
                                }`}>
                                  {formatPrice(range.min)} - {formatPrice(range.max)}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">All Categories</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {PRICE_RANGES.map(range => {
                        const Icon = range.icon;
                        const isSelected = value[0] === range.min && value[1] === range.max;
                        
                        return (
                          <Button
                            key={range.id}
                            variant="outline"
                            size="sm"
                            className={`justify-start ${
                              isSelected 
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handlePresetSelect(range)}
                          >
                            <Icon className="w-3 h-3 mr-2" />
                            <span className="text-xs">{range.label}</span>
                            <span className="ml-auto text-xs text-gray-500">
                              {formatPrice(range.min)} - {formatPrice(range.max)}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Range Slider */}
              {activeTab === 'slider' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-4">
                      <span>Min: {formatPrice(value[0])}</span>
                      <span>Max: {formatPrice(value[1])}</span>
                    </div>
                    
                    {/* Dual Range Slider */}
                    <div className="relative">
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Minimum Price</label>
                          <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="5000"
                            value={value[0]}
                            onChange={(e) => handleSliderChange('min', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Maximum Price</label>
                          <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="5000"
                            value={value[1]}
                            onChange={(e) => handleSliderChange('max', parseInt(e.target.value))}
                            className="w-full h-2 bg-gradient-to-r from-cyan-200 to-blue-300 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Adjustment Buttons */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Adjustments</h4>
                    <div className="flex flex-wrap gap-2">
                      {[10000, 25000, 50000, 100000, 200000].map(amount => (
                        <Badge
                          key={amount}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSliderChange('max', amount)}
                        >
                          Up to {formatPrice(amount)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Input */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Min Price (THB)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="h-10"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Max Price (THB)
                      </label>
                      <Input
                        type="number"
                        placeholder="1000000"
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        className="h-10"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCustomApply}
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Apply Custom Range
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  disabled={!isFiltered}
                >
                  Clear Filter
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Active Filter Display */}
      {isFiltered && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-cyan-50 text-cyan-700 border-cyan-200 flex items-center gap-1"
          >
            {getDisplayText()}
            <X 
              className="w-3 h-3 cursor-pointer hover:text-cyan-900" 
              onClick={clearFilter} 
            />
          </Badge>
        </div>
      )}
    </div>
  );
}