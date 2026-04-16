const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/thefolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });
        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin:', error);
        mongoose.disconnect();
    }
}

createAdmin();