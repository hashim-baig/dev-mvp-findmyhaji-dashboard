// MongoDB Initialization Script for FindMyHaji
print('🕋 Initializing FindMyHaji Database...');

// Switch to findmyhaji database
db = db.getSiblingDB('findmyhaji');

// Create admin user for the application
db.createUser({
  user: 'findmyhaji_user',
  pwd: 'findmyhaji_password',
  roles: [
    {
      role: 'readWrite',
      db: 'findmyhaji'
    }
  ]
});

// Create collections with initial data
print('Creating collections...');

// Create sample pilgrim data
db.pilgrims.insertMany([
  {
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    passportNumber: 'SA123456789',
    nationality: 'Saudi Arabia',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'male',
    groupId: new ObjectId(),
    currentLocation: {
      type: 'Point',
      coordinates: [39.8262, 21.4225], // Makkah
      address: 'Masjid al-Haram, Makkah',
      lastUpdated: new Date()
    },
    journeyStages: {
      ihram: { completed: true, completedAt: new Date() },
      tawaf: { completed: true, completedAt: new Date(), rounds: 7 },
      sai: { completed: false, rounds: 0 },
      arafat: { completed: false },
      muzdalifah: { completed: false },
      jamarat: { completed: false },
      tawafalWada: { completed: false }
    },
    deviceInfo: {
      batteryLevel: 85,
      signalStrength: 4,
      lastSeen: new Date(),
      isOnline: true
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Fatima Al-Zahra',
    email: 'fatima@example.com',
    phone: '+966501234568',
    passportNumber: 'SA123456790',
    nationality: 'Saudi Arabia',
    dateOfBirth: new Date('1990-07-22'),
    gender: 'female',
    groupId: new ObjectId(),
    currentLocation: {
      type: 'Point',
      coordinates: [39.8178, 21.4267], // Near Haram
      address: 'Near Masjid al-Haram, Makkah',
      lastUpdated: new Date()
    },
    journeyStages: {
      ihram: { completed: true, completedAt: new Date() },
      tawaf: { completed: true, completedAt: new Date(), rounds: 7 },
      sai: { completed: true, completedAt: new Date(), rounds: 7 },
      arafat: { completed: false },
      muzdalifah: { completed: false },
      jamarat: { completed: false },
      tawafalWada: { completed: false }
    },
    deviceInfo: {
      batteryLevel: 45,
      signalStrength: 3,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isOnline: true
    },
    status: 'low_battery',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create sample groups
db.groups.insertMany([
  {
    name: 'Group Alpha',
    description: 'Premium Hajj package group',
    leader: {
      name: 'Imam Abdullah',
      title: 'Imam',
      phone: '+966501234001',
      email: 'imam.abdullah@findmyhaji.com'
    },
    schedule: {
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-15')
    },
    currentStage: 'tawaf',
    currentLocation: {
      name: 'Makkah',
      coordinates: [39.8262, 21.4225],
      lastUpdated: new Date()
    },
    capacity: 50,
    pilgrimCount: 45,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Group Beta',
    description: 'Standard Hajj package group',
    leader: {
      name: 'Sheikh Muhammad',
      title: 'Sheikh',
      phone: '+966501234002',
      email: 'sheikh.muhammad@findmyhaji.com'
    },
    schedule: {
      startDate: new Date('2025-06-03'),
      endDate: new Date('2025-06-17')
    },
    currentStage: 'sai',
    currentLocation: {
      name: 'Makkah',
      coordinates: [39.8262, 21.4225],
      lastUpdated: new Date()
    },
    capacity: 40,
    pilgrimCount: 38,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for performance
print('Creating indexes...');

// Pilgrim indexes
db.pilgrims.createIndex({ 'currentLocation': '2dsphere' });
db.pilgrims.createIndex({ 'groupId': 1, 'status': 1 });
db.pilgrims.createIndex({ 'email': 1 }, { unique: true });
db.pilgrims.createIndex({ 'passportNumber': 1 }, { unique: true });
db.pilgrims.createIndex({ 'createdAt': -1 });

// Group indexes
db.groups.createIndex({ 'name': 1 }, { unique: true });
db.groups.createIndex({ 'status': 1, 'currentStage': 1 });
db.groups.createIndex({ 'createdAt': -1 });

print('✅ FindMyHaji database initialization completed successfully!');
print('📊 Sample data created:');
print('   - 2 pilgrims');
print('   - 2 groups');
print('   - Performance indexes');
print('🕋 Database ready for FindMyHaji Operations Center');