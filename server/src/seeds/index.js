// Seed runner — populates MongoDB with initial departments, subjects, and admin user

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from project root
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const cseSubjects = require('./subjects');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // 1. Seed CSE Department
    console.log('📁 Seeding departments...');
    let cseDept = await Department.findOne({ code: 'CSE' });
    if (!cseDept) {
      cseDept = await Department.create({
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering, NIT Jalandhar',
      });
      console.log('   ✅ CSE department created');
    } else {
      console.log('   ⏭️  CSE department already exists');
    }

    // Add more departments for future extensibility
    const otherDepts = [
      { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of ECE, NIT Jalandhar' },
      { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering, NIT Jalandhar' },
      { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering, NIT Jalandhar' },
      { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering, NIT Jalandhar' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology, NIT Jalandhar' },
      { name: 'Industrial and Production Engineering', code: 'IPE', description: 'Department of IPE, NIT Jalandhar' },
      { name: 'Chemical Engineering', code: 'CHE', description: 'Department of Chemical Engineering, NIT Jalandhar' },
      { name: 'Biotechnology', code: 'BT', description: 'Department of Biotechnology, NIT Jalandhar' },
      { name: 'Textile Technology', code: 'TT', description: 'Department of Textile Technology, NIT Jalandhar' },
    ];

    for (const dept of otherDepts) {
      const exists = await Department.findOne({ code: dept.code });
      if (!exists) {
        await Department.create(dept);
        console.log(`   ✅ ${dept.code} department created`);
      } else {
        console.log(`   ⏭️  ${dept.code} department already exists`);
      }
    }

    // 2. Seed CSE Subjects
    console.log('\n📚 Seeding CSE subjects...');
    let subjectsCreated = 0;
    for (const subj of cseSubjects) {
      const exists = await Subject.findOne({ code: subj.code, department: cseDept._id });
      if (!exists) {
        await Subject.create({
          ...subj,
          department: cseDept._id,
        });
        subjectsCreated++;
      }
    }
    console.log(`   ✅ ${subjectsCreated} new subjects created (${cseSubjects.length - subjectsCreated} already existed)`);

    // 3. Seed Admin User
    console.log('\n👤 Seeding admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nitj.ac.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        mustChangePassword: false,
        isActive: true,
        department: cseDept._id,
      });
      console.log(`   ✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`   ⏭️  Admin user already exists: ${adminEmail}`);
    }

    // 4. Seed a sample teacher and student for testing
    console.log('\n👥 Seeding test users...');
    const testUsers = [
      {
        email: 'teacher@nitj.ac.in',
        password: 'teacher123',
        role: 'teacher',
        firstName: 'Demo',
        lastName: 'Teacher',
        department: cseDept._id,
        mustChangePassword: true,
      },
      {
        email: 'student@nitj.ac.in',
        password: '21105001',
        role: 'student',
        firstName: 'Demo',
        lastName: 'Student',
        rollNumber: '21105001',
        department: cseDept._id,
        mustChangePassword: true,
      },
    ];

    for (const testUser of testUsers) {
      const exists = await User.findOne({ email: testUser.email });
      if (!exists) {
        await User.create(testUser);
        console.log(`   ✅ ${testUser.role} created: ${testUser.email}`);
      } else {
        console.log(`   ⏭️  ${testUser.role} already exists: ${testUser.email}`);
      }
    }

    console.log('\n✅ Database seeding complete!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:   admin@nitj.ac.in / admin123');
    console.log('   Teacher: teacher@nitj.ac.in / teacher123');
    console.log('   Student: student@nitj.ac.in / 21105001\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
