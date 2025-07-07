// Test script to debug payment processing
const axios = require('axios');

async function testPayment() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // Step 1: Register user first
        console.log('1. Registering user...');
        try {
            const registerResponse = await axios.post(`${baseURL}/auth/register`, {
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpass'
            });
            console.log('Register response:', registerResponse.data);
        } catch (regError) {
            console.log('Registration failed (user might exist):', regError.response?.data?.message || regError.message);
        }
        
        // Step 2: Login
        console.log('2. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'testuser',
            password: 'testpass'
        });
        console.log('Login response:', loginResponse.data);
        
        const token = loginResponse.data.token;
        
        // Step 3: Create transaction
        console.log('3. Creating transaction...');
        const createResponse = await axios.post(`${baseURL}/payment/create`, {
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
        console.log('Create response:', createResponse.data);
        
        const transactionId = createResponse.data.data.transactionId;
        
        // Step 4: Process payment
        console.log('4. Processing payment...');
        const processResponse = await axios.post(`${baseURL}/payment/process/${transactionId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Process response:', processResponse.data);
        
    } catch (error) {
        console.error('Error details:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        if (error.response?.data?.error) {
            console.error('Server error:', error.response.data.error);
        }
    }
}

testPayment();
