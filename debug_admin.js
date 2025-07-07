const axios = require('axios');

async function debugAdminLogin() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('🔍 DEBUG: Testing admin login flow...\n');
        
        // 1. Test login
        console.log('1. Testing admin login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('✅ Login Response:', {
            success: loginResponse.data.success,
            user: loginResponse.data.user,
            hasToken: !!loginResponse.data.token
        });
        
        const token = loginResponse.data.token;
        
        // 2. Test profile endpoint
        console.log('\n2. Testing profile endpoint...');
        const profileResponse = await axios.get(`${baseURL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Profile Response:', profileResponse.data);
        
        // 3. Test admin dashboard
        console.log('\n3. Testing admin dashboard...');
        const dashboardResponse = await axios.get(`${baseURL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Dashboard Response:', {
            success: dashboardResponse.data.success,
            hasData: !!dashboardResponse.data.data
        });
        
        console.log('\n🎉 All tests passed! Admin login should work.');
        
    } catch (error) {
        console.error('\n❌ ERROR:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

debugAdminLogin().then(() => process.exit(0));
