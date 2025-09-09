// Modern FindMyHaji Admin Dashboard Mock Data
export const mockRealTimeTracking = {
  totalActivePilgrims: 1247,
  activeGroups: 23,
  emergencyAlerts: 2,
  lastUpdate: '2025-01-15T14:30:00Z'
};

export const mockPilgrimLocations = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    group: 'Group Alpha',
    lat: 21.4225,
    lng: 39.8262,
    location: 'Masjid al-Haram',
    stage: 'Tawaf',
    batteryLevel: 85,
    signalStrength: 4,
    lastSeen: '2 min ago',
    status: 'active'
  },
  {
    id: 2,
    name: 'Fatima Al-Zahra',
    group: 'Group Beta',
    lat: 21.4267,
    lng: 39.8178,
    location: 'Near Haram',
    stage: 'Rest',
    batteryLevel: 45,
    signalStrength: 3,
    lastSeen: '5 min ago',
    status: 'low_battery'
  },
  {
    id: 3,
    name: 'Omar Ibn Khattab',
    group: 'Group Gamma',
    lat: 21.3891,
    lng: 39.8579,
    location: 'Mina',
    stage: 'Jamarat',
    batteryLevel: 92,
    signalStrength: 5,
    lastSeen: '1 min ago',
    status: 'active'
  },
  {
    id: 4,
    name: 'Aisha Bint Abu Bakr',
    group: 'Group Alpha',
    lat: 21.4033,
    lng: 39.8708,
    location: 'Arafat',
    stage: 'Dua',
    batteryLevel: 15,
    signalStrength: 2,
    lastSeen: '15 min ago',
    status: 'emergency'
  }
];

export const mockGroups = [
  {
    id: 1,
    name: 'Group Alpha',
    leader: 'Imam Abdullah',
    pilgrims: 45,
    startDate: '2025-01-10',
    currentStage: 'Tawaf',
    status: 'active',
    contact: '+966 50 123 4567'
  },
  {
    id: 2,
    name: 'Group Beta',
    leader: 'Sheikh Muhammad',
    pilgrims: 38,
    startDate: '2025-01-12',
    currentStage: 'Sa\'i',
    status: 'active',
    contact: '+966 50 234 5678'
  },
  {
    id: 3,
    name: 'Group Gamma',
    leader: 'Ustaz Hassan',
    pilgrims: 52,
    startDate: '2025-01-08',
    currentStage: 'Jamarat',
    status: 'active',
    contact: '+966 50 345 6789'
  }
];

export const mockFamilyMessages = [
  {
    id: 1,
    pilgrimName: 'Ahmed Al-Rashid',
    familyContact: 'Khadija Al-Rashid (Wife)',
    message: 'Alhamdulillah, I have safely reached Makkah and completed my first Tawaf. The experience is indescribable. Please keep me in your duas.',
    timestamp: '2025-01-15T13:45:00Z',
    status: 'sent',
    type: 'location_update'
  },
  {
    id: 2,
    pilgrimName: 'Fatima Al-Zahra',
    familyContact: 'Ali Al-Zahra (Husband)',
    message: 'Currently in Mina for the Jamarat ritual. Everything is going smoothly, Alhamdulillah. Missing everyone at home.',
    timestamp: '2025-01-15T12:30:00Z',
    status: 'sent',
    type: 'status_update'
  },
  {
    id: 3,
    pilgrimName: 'Omar Ibn Khattab',
    familyContact: 'Hafsa Ibn Khattab (Daughter)',
    message: 'Baba is doing great! He just finished at Arafat and is now heading to Muzdalifah. His health is good and spirits are high.',
    timestamp: '2025-01-15T11:15:00Z',
    status: 'sent',
    type: 'health_update'
  }
];

export const mockCommunications = [
  {
    id: 1,
    type: 'admin_message',
    from: 'Admin Control',
    to: 'All Group Leaders',
    message: 'Weather alert: Light rain expected in Mina area. Please ensure pilgrims have appropriate clothing.',
    timestamp: '2025-01-15T14:00:00Z',
    priority: 'high'
  },
  {
    id: 2,
    type: 'group_chat',
    from: 'Imam Abdullah',
    to: 'Group Alpha',
    message: 'Group meeting at 3 PM near Gate 1. Please gather all members.',
    timestamp: '2025-01-15T13:30:00Z',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'emergency',
    from: 'Medical Team',
    to: 'Admin Control',
    message: 'Minor injury reported for pilgrim Omar Ibn Khattab. First aid provided, no further action needed.',
    timestamp: '2025-01-15T12:45:00Z',
    priority: 'high'
  }
];

export const mockJourneyUpdates = [
  {
    id: 1,
    pilgrimName: 'Ahmed Al-Rashid',
    stage: 'Tawaf Complete',
    location: 'Masjid al-Haram',
    timestamp: '2025-01-15T13:45:00Z',
    type: 'milestone',
    description: 'Successfully completed 7 rounds of Tawaf around the Kaaba'
  },
  {
    id: 2,
    pilgrimName: 'Fatima Al-Zahra',
    stage: 'Sa\'i in Progress',
    location: 'Safa-Marwah',
    timestamp: '2025-01-15T13:20:00Z',
    type: 'progress',
    description: 'Currently performing Sa\'i between Safa and Marwah - Round 4/7'
  },
  {
    id: 3,
    pilgrimName: 'Aisha Bint Abu Bakr',
    stage: 'Emergency Alert',
    location: 'Arafat',
    timestamp: '2025-01-15T12:30:00Z',
    type: 'alert',
    description: 'Low battery alert - Last seen 15 minutes ago near Plain of Arafat'
  },
  {
    id: 4,
    pilgrimName: 'Omar Ibn Khattab',
    stage: 'Jamarat Complete',
    location: 'Mina',
    timestamp: '2025-01-15T11:45:00Z',
    type: 'milestone',
    description: 'Successfully completed stoning of Jamarat Al-Aqaba'
  }
];

export const mockAnalytics = {
  totalPilgrims: 1247,
  activeJourneys: 23,
  sosTriggered: 3,
  completedMilestones: {
    'Tawaf': 892,
    'Sa\'i': 745,
    'Arafat': 234,
    'Jamarat': 156,
    'Complete': 89
  },
  checkInFrequency: [
    { time: '6 AM', count: 45 },
    { time: '9 AM', count: 120 },
    { time: '12 PM', count: 180 },
    { time: '3 PM', count: 220 },
    { time: '6 PM', count: 195 },
    { time: '9 PM', count: 87 },
    { time: '12 AM', count: 23 }
  ],
  groupLocations: [
    { location: 'Makkah', count: 567, color: '#D4AF37' },
    { location: 'Mina', count: 345, color: '#8B4513' },
    { location: 'Arafat', count: 234, color: '#F5DEB3' },
    { location: 'Muzdalifah', count: 101, color: '#2F2F2F' }
  ]
};

export const mockNotifications = [
  {
    id: 1,
    title: 'Emergency Alert',
    message: 'Pilgrim Aisha needs immediate assistance - Low battery & missed check-in',
    type: 'emergency',
    timestamp: '5 min ago',
    read: false
  },
  {
    id: 2,
    title: 'Group Update',
    message: 'Group Alpha successfully completed Tawaf - 45/45 members checked in',
    type: 'success',
    timestamp: '15 min ago',
    read: false
  },
  {
    id: 3,
    title: 'Weather Alert',
    message: 'Light rain expected in Mina area - Groups notified',
    type: 'warning',
    timestamp: '1 hour ago',
    read: true
  }
];

export const mockAdminUser = {
  name: 'Khazi Naseeruddin',
  email: 'admin@findmyhaji.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  role: 'Operations Director',
  location: 'Makkah Control Center'
};