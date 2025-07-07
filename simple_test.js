const axios = require('axios');

async function simpleTest() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('Testing login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'testuser',
            password: 'testpass'
        });
        console.log('Login successful:', loginResponse.data);
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
    }
}

simpleTest().then(() => process.exit(0));
