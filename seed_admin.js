const axios = require('axios');

async function createAdminUser() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('Creating admin user...');
        
        // Create admin user
        const adminData = {
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        };
        
        const response = await axios.post(`${baseURL}/auth/register`, adminData);
        console.log('Admin user created:', response.data);
        
        // Update user to admin role directly in database
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./database.sqlite');
        
        db.run("UPDATE users SET role = 'admin' WHERE username = 'admin'", (err) => {
            if (err) {
                console.error('Error updating user role:', err);
            } else {
                console.log('User role updated to admin');
            }
            db.close();
        });
        
    } catch (error) {
        console.error('Error creating admin user:', error.response?.data || error.message);
    }
}

// Also create a test regular user
async function createTestUser() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('Creating test user...');
        
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass'
        };
        
        const response = await axios.post(`${baseURL}/auth/register`, userData);
        console.log('Test user created:', response.data);
        
    } catch (error) {
        console.error('Error creating test user:', error.response?.data || error.message);
    }
}

async function seedDatabase() {
    await createAdminUser();
    await createTestUser();
    console.log('Database seeding completed');
    process.exit(0);
}

seedDatabase();
