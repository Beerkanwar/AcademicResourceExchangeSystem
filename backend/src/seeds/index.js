// Seed runner — populates MongoDB with initial departments, subjects, and admin user

const path = require('path');
const dotenv = require('dotenv');

// Load env from project root
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const cseSubjects = require('./subjects');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Starting database seed');

    // 1. Seed CSE Department
    logger.info('Seeding departments');
    let cseDept = await Department.findOne({ code: 'CSE' });
    if (!cseDept) {
      cseDept = await Department.create({
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering, NIT Jalandhar',
      });
      logger.info('Department created', { code: 'CSE' });
    } else {
      logger.debug('Department already exists', { code: 'CSE' });
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
        logger.info('Department created', { code: dept.code });
      } else {
        logger.debug('Department already exists', { code: dept.code });
      }
    }

    // 2. Seed CSE Subjects
    logger.info('Seeding CSE subjects');
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
    logger.info('Subjects seeded', {
      created: subjectsCreated,
      alreadyExisted: cseSubjects.length - subjectsCreated,
    });

    // 3. Seed Admin User
    logger.info('Seeding admin user');
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
      logger.info('Admin user created', { email: adminEmail });
    } else {
      logger.debug('Admin user already exists', { email: adminEmail });
    }

    // 4. Seed a sample teacher and student for testing
    logger.info('Seeding test users');
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
        logger.info('Test user created', { role: testUser.role, email: testUser.email });
      } else {
        logger.debug('Test user already exists', { role: testUser.role, email: testUser.email });
      }
    }

    logger.info('Database seeding complete', {
      credentials: {
        admin: 'admin@nitj.ac.in / admin123',
        teacher: 'teacher@nitj.ac.in / teacher123',
        student: 'student@nitj.ac.in / 21105001',
      },
    });

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

seedDatabase();
