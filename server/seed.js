require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const PG = require('./models/PG');
const Room = require('./models/Room');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  // Clear existing seed data
  await User.deleteMany({ email: { $in: ['admin@pgmanage.com', 'owner@pgmanage.com'] } });

  console.log('🌱 Seeding admin and demo owner...');

  // Create Admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@pgmanage.com',
    password: 'Admin@123',
    phone: '9000000000',
    role: 'admin',
  });
  console.log(`✅ Admin created: ${admin.email} / Admin@123`);

  // Create Demo Owner
  const owner = await User.create({
    name: 'Ravi Kumar',
    email: 'owner@pgmanage.com',
    password: 'Owner@123',
    phone: '9111111111',
    role: 'owner',
  });
  console.log(`✅ Demo owner created: ${owner.email} / Owner@123`);

  // Create Sample PGs
  const pg1 = await PG.create({
    owner: owner._id,
    name: 'Green Valley PG',
    description: 'A comfortable and affordable PG for working professionals. Located in the heart of the city with all amenities.',
    category: 'boys',
    address: { street: '12, MG Road', locality: 'Koramangala', city: 'Bangalore', pincode: '560095', state: 'Karnataka' },
    images: [],
    amenities: ['WiFi', 'AC', 'Laundry', 'CCTV', 'Parking', 'Meals'],
    houseRules: 'No smoking. Guests allowed till 10 PM. Keep common areas clean.',
    contactPhone: '9222222222',
    startingRent: 8000,
    status: 'active',
    totalRooms: 3,
    availableRooms: 2,
    rating: 4.2,
    totalReviews: 15,
  });

  const pg2 = await PG.create({
    owner: owner._id,
    name: 'Sunrise Girls PG',
    description: 'Safe and secure PG exclusively for women. 24/7 security with all modern amenities.',
    category: 'girls',
    address: { street: '45, HSR Layout', locality: 'HSR Layout', city: 'Bangalore', pincode: '560102', state: 'Karnataka' },
    images: [],
    amenities: ['WiFi', 'CCTV', 'Meals', 'Laundry', 'Gym'],
    houseRules: 'Girls only. Entry timing 10 PM. No smoking/drinking.',
    contactPhone: '9333333333',
    startingRent: 7500,
    status: 'active',
    totalRooms: 2,
    availableRooms: 1,
    rating: 4.5,
    totalReviews: 22,
  });

  // Create Rooms
  await Room.create([
    { pg: pg1._id, owner: owner._id, roomNumber: '101', type: 'single', floor: '1st', isAC: true, rent: 10000, status: 'occupied' },
    { pg: pg1._id, owner: owner._id, roomNumber: '102', type: 'double', floor: '1st', isAC: false, rent: 8000, status: 'vacant' },
    { pg: pg1._id, owner: owner._id, roomNumber: '103', type: 'triple', floor: '2nd', isAC: false, rent: 6000, status: 'vacant' },
    { pg: pg2._id, owner: owner._id, roomNumber: 'A1', type: 'single', floor: 'Ground', isAC: true, rent: 9000, status: 'occupied' },
    { pg: pg2._id, owner: owner._id, roomNumber: 'A2', type: 'double', floor: '1st', isAC: false, rent: 7500, status: 'vacant' },
  ]);

  console.log('✅ Sample PGs and rooms seeded');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin: admin@pgmanage.com / Admin@123');
  console.log('   Owner: owner@pgmanage.com / Owner@123');
  console.log('\n🎉 Seed complete!');
  mongoose.disconnect();
};

seedData().catch(console.error);
