const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
    try {
        // Connect to MongoDB using the environment variable
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Test user data
        const testUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test@123',
            role: 'student',
            firstName: 'Test',
            lastName: 'User',
            studentId: 'ST12345',
            academicYear: 2
        };

        // Check if test user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: testUser.email },
                { username: testUser.username },
                { studentId: testUser.studentId }
            ]
        });

        if (existingUser) {
            console.log('Test user already exists. Deleting...');
            await User.deleteOne({ _id: existingUser._id });
        }

        // Create new test user
        const user = await User.create(testUser);

        console.log('Test user created successfully:');
        console.log({
            username: user.username,
            email: user.email,
            role: user.role,
            password: 'Test@123' // Only logging for testing purposes
        });

        console.log('\nYou can now test login with:');
        console.log('Email: test@example.com');
        console.log('Password: Test@123');

    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
createTestUser(); 