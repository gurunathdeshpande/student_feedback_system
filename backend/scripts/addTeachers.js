const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function addTeachers() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/feedback', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Sample teachers
        const teachers = [
            { username: 'John Smith', password: 'password123', role: 'teacher' },
            { username: 'Mary Johnson', password: 'password123', role: 'teacher' },
            { username: 'David Wilson', password: 'password123', role: 'teacher' },
            { username: 'Sarah Brown', password: 'password123', role: 'teacher' }
        ];

        // Hash passwords and create users
        for (const teacher of teachers) {
            const hashedPassword = await bcrypt.hash(teacher.password, 10);
            
            // Check if teacher already exists
            const existingTeacher = await User.findOne({ username: teacher.username });
            if (!existingTeacher) {
                await User.create({
                    ...teacher,
                    password: hashedPassword
                });
                console.log(`Created teacher: ${teacher.username}`);
            } else {
                console.log(`Teacher ${teacher.username} already exists`);
            }
        }

        console.log('All teachers added successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addTeachers(); 