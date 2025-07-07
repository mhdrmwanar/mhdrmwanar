const axios = require('axios');

async function testFlow() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // Test registration
        console.log('1. Registering new user...');
        const registerResponse = await axios.post(`${baseURL}/auth/register`, {
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'testpass123'
        });
        console.log('Register response:', registerResponse.data);
        
        // Test login
        console.log('2. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'testuser2',
            password: 'testpass123'
        });
        console.log('Login response:', loginResponse.data);
        
        const token = loginResponse.data.token;
        
        // Test payment creation
        console.log('3. Creating payment...');
        const paymentResponse = await axios.post(`${baseURL}/payment/create`, {
            amount: 100000,
            currency: 'IDR',
            paymentMethod: 'credit_card',
            paymentData: {
                cardNumber: '4111111111111111',
                cardHolder: 'Test User',
                expiryMonth: '12',
                expiryYear: '2025',
                cvv: '123'
            },
            description: 'Test payment'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Payment create response:', paymentResponse.data);
        
        const transactionId = paymentResponse.data.data.transactionId;
        
        // Test payment processing
        console.log('4. Processing payment...');
        const processResponse = await axios.post(`${baseURL}/payment/process/${transactionId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Payment process response:', processResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testFlow().then(() => process.exit(0));
