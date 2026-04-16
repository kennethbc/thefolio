require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const exists = await User.findOne({ email: 'admin@thefolio.com' });
    if (exists) {
      console.log('⚠️ Admin account already exists.');
      console.log('📧 Email: admin@thefolio.com');
      console.log('🔑 Password: admin123');
      process.exit();
    }
    
    // I-hash ang password bago i-save
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'TheFolio Admin',
      email: 'admin@thefolio.com',
      password: hashedPassword,
      role: 'admin',
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@thefolio.com');
    console.log('🔑 Password: admin123');
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
    