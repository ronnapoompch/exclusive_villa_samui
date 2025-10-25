const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Mock session for admin
const adminSession = {
  user: {
    id: 'admin-id',
    role: 'ADMIN',
    email: 'admin@exclusivevillasamui.com'
  }
};

async function testAdminSystem() {
  console.log('🧪 Testing Admin System...\n');
  
  try {
    // Test 1: Admin Dashboard
    console.log('1. 📊 Testing Admin Dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin`);
    console.log(`   Status: ${dashboardResponse.status}`);
    
    // Test 2: Admin Villas API
    console.log('\n2. 🏡 Testing Admin Villas API...');
    
    // GET all villas
    const villasResponse = await fetch(`${BASE_URL}/api/admin/villas`);
    const villasData = await villasResponse.json();
    console.log(`   GET Villas Status: ${villasResponse.status}`);
    console.log(`   Villas Count: ${villasData.data?.length || 0}`);
    
    if (villasData.data && villasData.data.length > 0) {
      const firstVilla = villasData.data[0];
      console.log(`   First Villa: ${firstVilla.name} (${firstVilla.slug})`);
      
      // Test individual villa
      console.log('\n3. 🏠 Testing Individual Villa API...');
      const villaResponse = await fetch(`${BASE_URL}/api/admin/villas/${firstVilla.id}`);
      const villaData = await villaResponse.json();
      console.log(`   GET Villa Status: ${villaResponse.status}`);
      console.log(`   Villa Name: ${villaData.data?.name || 'N/A'}`);
    }
    
    // Test 4: Admin Bookings API
    console.log('\n4. 📋 Testing Admin Bookings API...');
    const bookingsResponse = await fetch(`${BASE_URL}/api/admin/bookings`);
    const bookingsData = await bookingsResponse.json();
    console.log(`   Status: ${bookingsResponse.status}`);
    console.log(`   Bookings Count: ${bookingsData.data?.length || 0}`);
    
    // Test 5: Admin Stats API
    console.log('\n5. 📈 Testing Admin Stats API...');
    const statsResponse = await fetch(`${BASE_URL}/api/admin/stats`);
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Total Revenue: ฿${statsData.data?.totalRevenue || 0}`);
    console.log(`   Total Bookings: ${statsData.data?.totalBookings || 0}`);
    
    // Test 6: Create Villa (POST)
    console.log('\n6. ➕ Testing Create Villa...');
    const newVilla = {
      name: 'Test Villa Admin',
      slug: 'test-villa-admin',
      description: 'A test villa created by admin system',
      location: 'Test Location',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Pool', 'Kitchen'],
      images: ['test1.jpg', 'test2.jpg'],
      pricePerNight: 5000,
      status: 'ACTIVE'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/villas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVilla)
    });
    
    const createData = await createResponse.json();
    console.log(`   Create Status: ${createResponse.status}`);
    
    if (createResponse.ok && createData.data) {
      console.log(`   Created Villa ID: ${createData.data.id}`);
      
      // Test 7: Update Villa (PUT)
      console.log('\n7. ✏️ Testing Update Villa...');
      const updateData = {
        name: 'Updated Test Villa Admin',
        pricePerNight: 6000
      };
      
      const updateResponse = await fetch(`${BASE_URL}/api/admin/villas/${createData.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      console.log(`   Update Status: ${updateResponse.status}`);
      console.log(`   Updated Name: ${updateResult.data?.name || 'N/A'}`);
      
      // Test 8: Delete Villa (DELETE)
      console.log('\n8. 🗑️ Testing Delete Villa...');
      const deleteResponse = await fetch(`${BASE_URL}/api/admin/villas/${createData.data.id}`, {
        method: 'DELETE'
      });
      
      const deleteResult = await deleteResponse.json();
      console.log(`   Delete Status: ${deleteResponse.status}`);
      console.log(`   Delete Message: ${deleteResult.message || 'N/A'}`);
    } else {
      console.log(`   Create failed: ${createData.error || 'Unknown error'}`);
    }
    
    // Test 9: Export Bookings
    console.log('\n9. 📤 Testing Export Bookings...');
    const exportResponse = await fetch(`${BASE_URL}/api/admin/export/bookings`);
    console.log(`   Export Status: ${exportResponse.status}`);
    console.log(`   Content-Type: ${exportResponse.headers.get('content-type')}`);
    
    console.log('\n✅ Admin System Testing Complete!');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

// Run tests
testAdminSystem();