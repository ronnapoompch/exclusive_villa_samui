'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  MapPin,
  Star,
  DollarSign,
  Search,
  Download,
  Home,
  Bed,
  Bath
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  images: string[];
  amenities: string[];
  active: boolean;
  createdAt: string;
  _count?: {
    bookings: number;
  };
}

interface Booking {
  id: string;
  villa: {
    name: string;
    slug: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

interface AdminStats {
  totalVillas: number;
  activeVillas: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  avgBookingValue: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'villas' | 'bookings'>('dashboard');
  const [villas, setVillas] = useState<Villa[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalVillas: 0,
    activeVillas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    avgBookingValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVillaModal, setShowVillaModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);

  // Villa form state
  const [villaForm, setVillaForm] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    maxGuests: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    amenities: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      redirect('/admin/login');
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchVillas(),
        fetchBookings(),
        fetchStats()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/admin/villas');
      if (response.ok) {
        const data = await response.json();
        // Add pricing to each villa
        const villasWithPricing = data.villas?.map((villa: any) => ({
          ...villa,
          pricePerNight: villa.pricing?.[0]?.dailyRate ? Number(villa.pricing[0].dailyRate) : 0
        })) || [];
        setVillas(villasWithPricing);
      }
    } catch (error) {
      console.error('Failed to fetch villas:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateVilla = () => {
    setEditingVilla(null);
    setVillaForm({
      name: '',
      description: '',
      pricePerNight: '',
      maxGuests: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      amenities: [],
      images: []
    });
    setShowVillaModal(true);
  };

  const handleEditVilla = (villa: Villa) => {
    setEditingVilla(villa);
    setVillaForm({
      name: villa.name,
      description: villa.description,
      pricePerNight: villa.pricePerNight.toString(),
      maxGuests: villa.maxGuests.toString(),
      bedrooms: villa.bedrooms.toString(),
      bathrooms: villa.bathrooms.toString(),
      location: villa.location,
      amenities: villa.amenities,
      images: villa.images
    });
    setShowVillaModal(true);
  };

  const handleSaveVilla = async () => {
    try {
      const villaData = {
        ...villaForm,
        pricePerNight: parseFloat(villaForm.pricePerNight),
        maxGuests: parseInt(villaForm.maxGuests),
        bedrooms: parseInt(villaForm.bedrooms),
        bathrooms: parseInt(villaForm.bathrooms)
      };

      const url = editingVilla 
        ? `/api/admin/villas/${editingVilla.id}` 
        : '/api/admin/villas';
      
      const method = editingVilla ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(villaData)
      });

      if (response.ok) {
        toast.success(editingVilla ? 'Villa updated!' : 'Villa created!');
        setShowVillaModal(false);
        fetchVillas();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save villa');
      }
    } catch (error) {
      toast.error('Failed to save villa');
    }
  };

  const handleDeleteVilla = async (villaId: string) => {
    if (!confirm('Are you sure you want to delete this villa?')) return;

    try {
      const response = await fetch(`/api/admin/villas/${villaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Villa deleted!');
        fetchVillas();
      } else {
        toast.error('Failed to delete villa');
      }
    } catch (error) {
      toast.error('Failed to delete villa');
    }
  };

  const toggleVillaStatus = async (villa: Villa) => {
    try {
      const response = await fetch(`/api/admin/villas/${villa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...villa, active: !villa.active })
      });

      if (response.ok) {
        toast.success(`Villa ${villa.active ? 'deactivated' : 'activated'}!`);
        fetchVillas();
      } else {
        toast.error('Failed to update villa status');
      }
    } catch (error) {
      toast.error('Failed to update villa status');
    }
  };

  const exportBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Bookings exported!');
      }
    } catch (error) {
      toast.error('Failed to export bookings');
    }
  };

  const filteredVillas = villas.filter(villa =>
    villa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    villa.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.villa.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your villa business</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('villas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'villas' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Villas
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'bookings' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Villas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVillas}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.villa.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">฿{booking.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Top Performing Villas</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {villas.slice(0, 5).map((villa) => (
                      <div key={villa.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{villa.name}</p>
                          <p className="text-sm text-gray-600">{villa.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">฿{villa.pricePerNight.toLocaleString()}/night</p>
                          <p className="text-sm text-gray-600">
                            {villa._count?.bookings || 0} bookings
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'villas' && (
          <div className="space-y-6">
            {/* Villa Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Villa Management</h2>
                <p className="text-gray-600">Manage your villa inventory</p>
              </div>
              <button
                onClick={handleCreateVilla}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Villa</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search villas..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Villas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVillas.map((villa) => (
                <div key={villa.id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    {villa.images[0] ? (
                      <img
                        src={villa.images[0]}
                        alt={villa.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{villa.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {villa.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        villa.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {villa.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {villa.maxGuests} guests
                      </span>
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {villa.bedrooms} beds
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {villa.bathrooms} baths
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ฿{villa.pricePerNight.toLocaleString()}
                        <span className="text-sm font-normal text-gray-600">/night</span>
                      </p>
                    </div>

                    <div className="mt-6 flex space-x-2">
                      <button
                        onClick={() => handleEditVilla(villa)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => toggleVillaStatus(villa)}
                        className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                          villa.active 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Eye className="h-4 w-4" />
                        <span>{villa.active ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVilla(villa.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Booking Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
                <p className="text-gray-600">View and manage customer bookings</p>
              </div>
              <button
                onClick={exportBookings}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Villa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                            <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.villa.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.guests}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">฿{booking.totalAmount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : booking.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Villa Modal */}
      {showVillaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVilla ? 'Edit Villa' : 'Create New Villa'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Villa Name</label>
                  <input
                    type="text"
                    value={villaForm.name}
                    onChange={(e) => setVillaForm({...villaForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Enter villa name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={villaForm.location}
                    onChange={(e) => setVillaForm({...villaForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={villaForm.description}
                  onChange={(e) => setVillaForm({...villaForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter villa description"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night</label>
                  <input
                    type="number"
                    value={villaForm.pricePerNight}
                    onChange={(e) => setVillaForm({...villaForm, pricePerNight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={villaForm.maxGuests}
                    onChange={(e) => setVillaForm({...villaForm, maxGuests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={villaForm.bedrooms}
                    onChange={(e) => setVillaForm({...villaForm, bedrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={villaForm.bathrooms}
                    onChange={(e) => setVillaForm({...villaForm, bathrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['WiFi', 'Pool', 'Kitchen', 'Parking', 'AC', 'Beach Access', 'Chef Service', 'Spa'].map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={villaForm.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVillaForm({...villaForm, amenities: [...villaForm.amenities, amenity]});
                          } else {
                            setVillaForm({...villaForm, amenities: villaForm.amenities.filter(a => a !== amenity)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-4">
              <button
                onClick={() => setShowVillaModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVilla}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                {editingVilla ? 'Update Villa' : 'Create Villa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}