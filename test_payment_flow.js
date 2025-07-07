const axios = require('axios');

async function testPaymentFlow() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // Test payment dengan user yang sudah ada
        console.log('1. Login user untuk payment...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'testuser2',
            password: 'testpass123'
        });
        console.log('Login berhasil:', loginResponse.data);
        
        const token = loginResponse.data.token;
        
        // Test payment creation
        console.log('2. Membuat transaksi payment...');
        const paymentResponse = await axios.post(`${baseURL}/payment/create`, {
            amount: 250000,
            currency: 'IDR',
            paymentMethod: 'credit_card',
            paymentData: {
                cardNumber: '4111111111111111',
                cardHolder: 'Test User 2',
                expiryMonth: '12',
                expiryYear: '2025',
                cvv: '123'
            },
            description: 'Test payment dari user biasa'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Payment created:', paymentResponse.data);
        
        const transactionId = paymentResponse.data.data.transactionId;
        
        // Test payment processing
        console.log('3. Memproses payment...');
        const processResponse = await axios.post(`${baseURL}/payment/process/${transactionId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Payment processed:', processResponse.data);
        
        // Test payment history
        console.log('4. Mengambil riwayat payment...');
        const historyResponse = await axios.get(`${baseURL}/payment/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Payment history:', historyResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testPaymentFlow().then(() => process.exit(0));
