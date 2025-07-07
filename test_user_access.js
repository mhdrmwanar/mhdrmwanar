const axios = require('axios');

async function testUserAccess() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // Test login sebagai user biasa
        console.log('1. Login sebagai user biasa...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'testuser2',
            password: 'testpass123'
        });
        console.log('Login berhasil:', loginResponse.data);
        
        const token = loginResponse.data.token;
        
        // Test akses admin dashboard (harus ditolak)
        console.log('2. Mencoba akses dashboard admin (harus ditolak)...');
        try {
            const dashboardResponse = await axios.get(`${baseURL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('UNEXPECTED: Dashboard admin berhasil diakses!', dashboardResponse.data);
        } catch (error) {
            console.log('EXPECTED: Akses admin ditolak -', error.response?.data);
        }
        
        // Test akses user profile (harus berhasil)
        console.log('3. Mengakses profile user (harus berhasil)...');
        const profileResponse = await axios.get(`${baseURL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Profile user:', profileResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testUserAccess().then(() => process.exit(0));
