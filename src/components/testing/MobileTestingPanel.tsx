'use client'

// Mobile Responsiveness Testing Tool
import { useState, useEffect } from 'react'
import { X, Minimize2, Monitor, Smartphone } from 'lucide-react'

const MobileTestingPanel = () => {
  const [currentDevice, setCurrentDevice] = useState('desktop')
  const [isMinimized, setIsMinimized] = useState(true) // เริ่มต้นด้วยการย่อ
  const [isVisible, setIsVisible] = useState(true)
  const [viewportInfo, setViewportInfo] = useState({
    width: 0,
    height: 0,
    devicePixelRatio: 1
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const devices = [
    { name: 'iPhone SE', width: 375, height: 667, className: 'xs' },
    { name: 'iPhone 12', width: 390, height: 844, className: 'xs' },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926, className: 'sm' },
    { name: 'Samsung Galaxy S21', width: 360, height: 800, className: 'xs' },
    { name: 'iPad Mini', width: 768, height: 1024, className: 'md' },
    { name: 'iPad Pro', width: 1024, height: 1366, className: 'lg' },
    { name: 'Desktop', width: 1920, height: 1080, className: 'xl' }
  ]

  const getBreakpointInfo = (width: number) => {
    if (width < 375) return { name: 'xs-', classes: 'Extra Small (< 375px)', color: 'text-red-600' }
    if (width < 640) return { name: 'xs', classes: 'Extra Small (375px+)', color: 'text-orange-600' }
    if (width < 768) return { name: 'sm', classes: 'Small (640px+)', color: 'text-yellow-600' }
    if (width < 1024) return { name: 'md', classes: 'Medium (768px+)', color: 'text-green-600' }
    if (width < 1280) return { name: 'lg', classes: 'Large (1024px+)', color: 'text-blue-600' }
    if (width < 1536) return { name: 'xl', classes: 'Extra Large (1280px+)', color: 'text-indigo-600' }
    return { name: '2xl', classes: '2X Large (1536px+)', color: 'text-purple-600' }
  }

  const breakpoint = getBreakpointInfo(viewportInfo.width)

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-40 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-12 h-12' : 'min-w-[280px] max-w-[320px]'
    }`}>
      {/* Minimized State */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          title="Open Responsive Testing Panel"
        >
          <Monitor className="w-5 h-5" />
        </button>
      ) : (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <div className="text-sm font-semibold text-gray-800">
                Responsive Panel
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Minimize Panel"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Close Panel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
        
        {/* Current Viewport Info */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Current Viewport:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Width: <span className="font-mono">{viewportInfo.width}px</span></div>
            <div>Height: <span className="font-mono">{viewportInfo.height}px</span></div>
          </div>
          <div className={`text-xs font-semibold ${breakpoint.color}`}>
            {breakpoint.name}: {breakpoint.classes}
          </div>
          <div className="text-xs text-gray-500">
            DPR: {viewportInfo.devicePixelRatio}x
          </div>
        </div>

        {/* Device Presets */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Test Devices:</div>
          <div className="grid grid-cols-1 gap-1">
            {devices.map((device) => (
              <button
                key={device.name}
                onClick={() => {
                  // This would ideally trigger browser dev tools device emulation
                  setCurrentDevice(device.name)
                  console.log(`Testing ${device.name}: ${device.width}x${device.height}`)
                }}
                className={`text-xs px-2 py-1 rounded text-left hover:bg-gray-100 transition-colors
                  ${currentDevice === device.name ? 'bg-blue-100 text-blue-800' : 'text-gray-700'}
                `}
              >
                <div className="flex justify-between">
                  <span>{device.name}</span>
                  <span className="text-gray-500">{device.width}×{device.height}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Tests */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Quick Tests:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 xs:bg-blue-500 sm:bg-yellow-500 md:bg-red-500 lg:bg-purple-500 xl:bg-pink-500"></span>
              <span>Breakpoint Indicator</span>
            </div>
            <div className="block xs:hidden text-red-600">❌ xs: Hidden on xs+</div>
            <div className="hidden xs:block sm:hidden text-orange-600">✅ xs: Visible on xs only</div>
            <div className="hidden sm:block md:hidden text-yellow-600">✅ sm: Visible on sm only</div>
            <div className="hidden md:block lg:hidden text-green-600">✅ md: Visible on md only</div>
            <div className="hidden lg:block xl:hidden text-blue-600">✅ lg: Visible on lg only</div>
            <div className="hidden xl:block text-purple-600">✅ xl: Visible on xl+</div>
          </div>
        </div>

          {/* Touch Test */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600">Touch Target Test:</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="touch-target bg-blue-500 text-white text-xs rounded">
                44px Min
              </button>
              <button className="w-8 h-8 bg-red-500 text-white text-xs rounded">
                32px
              </button>
            </div>
          </div>
          
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileTestingPanel