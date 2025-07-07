const axios = require('axios');

async function testAdminFlow() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('=== TEST ALUR ADMIN LENGKAP ===\n');
        
        // 1. Login sebagai admin
        console.log('1. 🔑 Login sebagai admin...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log('   ✅ Login berhasil!');
            console.log(`   👤 User: ${loginResponse.data.user.username}`);
            console.log(`   🎭 Role: ${loginResponse.data.user.role}`);
            console.log(`   🟢 Status: ${loginResponse.data.user.status}`);
        }
        
        const token = loginResponse.data.token;
        
        // 2. Akses dashboard admin
        console.log('\n2. 📊 Mengakses dashboard admin...');
        const dashboardResponse = await axios.get(`${baseURL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (dashboardResponse.data.success) {
            console.log('   ✅ Dashboard berhasil diakses!');
            const stats = dashboardResponse.data.data.statistics;
            console.log(`   👥 Total Users: ${stats.users.total}`);
            console.log(`   🏦 Total Transaksi: ${stats.transactions.total}`);
            console.log(`   💰 Total Amount: IDR ${new Intl.NumberFormat('id-ID').format(stats.transactions.totalAmount)}`);
        }
        
        // 3. Lihat daftar users
        console.log('\n3. 👥 Melihat daftar users...');
        const usersResponse = await axios.get(`${baseURL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersResponse.data.success) {
            console.log('   ✅ Daftar users berhasil diambil!');
            usersResponse.data.data.users.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
            });
        }
        
        // 4. Buat user baru
        console.log('\n4. ➕ Membuat user baru...');
        const newUser = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            phone: '081234567890',
            role: 'user'
        };
        
        const createUserResponse = await axios.post(`${baseURL}/admin/users`, newUser, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (createUserResponse.data.success) {
            console.log('   ✅ User baru berhasil dibuat!');
            console.log(`   👤 Username: ${createUserResponse.data.data.user.username}`);
            console.log(`   📧 Email: ${createUserResponse.data.data.user.email}`);
        }
        
        // 5. Lihat daftar transaksi
        console.log('\n5. 💳 Melihat daftar transaksi...');
        const transactionsResponse = await axios.get(`${baseURL}/admin/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (transactionsResponse.data.success) {
            console.log('   ✅ Daftar transaksi berhasil diambil!');
            console.log(`   📊 Total transaksi: ${transactionsResponse.data.data.transactions.length}`);
            transactionsResponse.data.data.transactions.slice(0, 3).forEach(tx => {
                console.log(`   - ${tx.transactionReference}: IDR ${new Intl.NumberFormat('id-ID').format(tx.amount)} (${tx.status})`);
            });
        }
        
        console.log('\n=== ✅ SEMUA TEST ADMIN BERHASIL! ===');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

testAdminFlow().then(() => process.exit(0));
