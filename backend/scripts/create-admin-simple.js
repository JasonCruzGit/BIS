// Simple script to create admin user via API
// Run this from your local machine or Render shell

const API_URL = process.env.API_URL || 'https://bis-mxip.onrender.com/api';

const adminData = {
  email: 'admin@barangay.gov.ph',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN'
};

async function createAdmin() {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.error('❌ Error:', data.message);
      if (data.message.includes('already exists')) {
        console.log('ℹ️  User already exists. Try logging in with:');
        console.log('   Email:', adminData.email);
        console.log('   Password:', adminData.password);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

createAdmin();

