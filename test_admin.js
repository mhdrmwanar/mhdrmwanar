const axios = require('axios');

async function testAdmin() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // Test login sebagai admin
        console.log('1. Login sebagai admin...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        console.log('Login berhasil:', loginResponse.data);
        
        const token = loginResponse.data.token;
        
        // Test admin dashboard
        console.log('2. Mengakses dashboard admin...');
        const dashboardResponse = await axios.get(`${baseURL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Dashboard admin:', dashboardResponse.data);
        
        // Test get users
        console.log('3. Mengambil daftar users...');
        const usersResponse = await axios.get(`${baseURL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Daftar users:', usersResponse.data);
        
        // Test get transactions
        console.log('4. Mengambil daftar transaksi...');
        const transactionsResponse = await axios.get(`${baseURL}/admin/transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Daftar transaksi:', transactionsResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAdmin().then(() => process.exit(0));
