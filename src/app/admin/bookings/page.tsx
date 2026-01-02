'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Calendar,
  User,
  Mail,
  Phone,
  DollarSign,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

interface Booking {
  id: string
  bookingReference: string
  villa: {
    name: string
    slug: string
  }
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  totalAmount: number
  status: BookingStatus
  payment: {
    status: string
    transactionId: string | null
  }[]
  createdAt: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/bookings')
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ))
        
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  // Filter and search
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'ALL' || booking.status === selectedStatus
    const matchesSearch = 
      (booking.bookingReference?.toLowerCase() || booking.id.slice(-8)).includes(searchQuery.toLowerCase()) ||
      (booking.guestName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (booking.guestEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (booking.villa?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const icons = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      CANCELLED: XCircle
    }
    
    const Icon = icons[status]
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookings Management</h1>
        <p className="text-gray-600">Manage all villa bookings and reservations</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, guest, or villa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as BookingStatus | 'ALL')
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-sm text-yellow-700">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-700">Confirmed</div>
            <div className="text-2xl font-bold text-green-900">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-sm text-red-700">Cancelled</div>
            <div className="text-2xl font-bold text-red-900">
              {bookings.filter(b => b.status === 'CANCELLED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Villa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || selectedStatus !== 'ALL' 
                      ? 'No bookings found matching your filters'
                      : 'No bookings yet'}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {booking.bookingReference || booking.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guestName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.guestEmail || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.villa?.name || 'Unknown Villa'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(booking.checkIn), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ฿{booking.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredBookings.length)}
                </span>{' '}
                of <span className="font-medium">{filteredBookings.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Booking Reference & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Booking Reference</div>
                  <div className="text-lg font-mono font-bold text-gray-900">
                    {selectedBooking.bookingReference || selectedBooking.id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <div>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              {/* Villa Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Villa Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">{selectedBooking.villa?.name || 'Unknown Villa'}</div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{selectedBooking.guestName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    {selectedBooking.guestEmail ? (
                      <a 
                        href={`mailto:${selectedBooking.guestEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedBooking.guestEmail}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    {selectedBooking.guestPhone ? (
                      <a 
                        href={`tel:${selectedBooking.guestPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedBooking.guestPhone}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stay Dates */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Check-in</div>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {format(new Date(selectedBooking.checkIn), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Check-out</div>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {format(new Date(selectedBooking.checkOut), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ฿{selectedBooking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.payment[0]?.transactionId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-gray-900">
                        {selectedBooking.payment[0].transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-medium text-green-600">
                      {selectedBooking.payment[0]?.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Change Status</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status !== 'CONFIRMED' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status !== 'PENDING' && selectedBooking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'PENDING')}
                      className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Set to Pending
                    </button>
                  )}
                  {selectedBooking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Booking Created */}
              <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-4">
                Created on {format(new Date(selectedBooking.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}