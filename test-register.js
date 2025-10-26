const testRegister = async () => {
  console.log('🧪 Testing Register API...\n');

  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123456',
    phone: '+66812345678'
  };

  console.log('📝 Registering user:', {
    name: testUser.name,
    email: testUser.email,
    phone: testUser.phone
  });

  try {
    const response = await fetch('http://localhost:3000/en/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('👤 User created:', {
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        role: data.user?.role
      });
      return data.user;
    } else {
      console.log('❌ Registration failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
};

testRegister().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
