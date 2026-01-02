require('dotenv').config({ path: '.env.local' });

async function testResendEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  
  console.log('\n🔍 Checking Resend Configuration...\n');
  console.log('API Key:', apiKey ? `${apiKey.slice(0, 10)}...` : '❌ Not found');
  console.log('From Email:', process.env.RESEND_FROM_EMAIL);
  
  if (!apiKey || apiKey === 're_placeholder_for_build_only') {
    console.log('\n⚠️  Resend API key not configured or is placeholder');
    console.log('\n📝 To enable email notifications:');
    console.log('1. Go to: https://resend.com/api-keys');
    console.log('2. Create a new API key');
    console.log('3. Update .env.local:');
    console.log('   RESEND_API_KEY=re_YOUR_KEY_HERE');
    console.log('4. Restart server');
    return;
  }

  console.log('\n📧 Testing Resend API...');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: 'test@example.com',
        subject: 'Test Email from Exclusive Villa Samui',
        html: '<p>This is a test email to verify Resend configuration.</p>',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Resend API is working!');
      console.log('Email ID:', data.id);
      console.log('\n🎉 Emails will be sent automatically after bookings!');
    } else {
      console.log('\n❌ Resend API Error:', data);
      if (data.message?.includes('API key')) {
        console.log('\n💡 The API key might be invalid or expired.');
        console.log('   Get a new one from: https://resend.com/api-keys');
      }
    }
  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
  }
}

testResendEmail();
