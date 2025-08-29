// backend/createAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js'; // ensure this path matches your project

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI missing in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env');
      process.exit(1);
    }

    const existing = await User.findOne({ email: adminEmail }).lean().exec();
    if (existing) {
      console.log(`Admin already exists: ${existing.email} (role: ${existing.role || 'N/A'})`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });

    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

main();
