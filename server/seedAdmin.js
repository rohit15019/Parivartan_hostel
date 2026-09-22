const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_db');
    console.log('MongoDB Connected for seeding admin');

    const adminEmail = 'vallabhdharejiya9@gmail.com';
    const adminPassword = 'Admin@123';

    // Remove any previous non-official admin accounts to ensure ONLY vallabhdharejiya9@gmail.com is admin
    const deletedAdmins = await User.deleteMany({
      role: 'admin',
      email: { $ne: adminEmail }
    });
    if (deletedAdmins.deletedCount > 0) {
      console.log(`Cleaned up ${deletedAdmins.deletedCount} old admin account(s).`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.password = hashedPassword;
      adminUser.rawPassword = adminPassword;
      adminUser.isEmailVerified = true;
      adminUser.resetPasswordOtp = null;
      adminUser.resetPasswordExpires = null;
      await adminUser.save();
      console.log(`Admin account updated successfully for: ${adminEmail}`);
    } else {
      adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
        rawPassword: adminPassword,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`Admin account created successfully for: ${adminEmail}`);
    }

    console.log('-------------------------------------------');
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
    console.log('-------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
