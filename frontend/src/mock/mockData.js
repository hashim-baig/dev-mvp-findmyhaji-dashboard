// Mock data for FindMyHaji Admin Dashboard
export const mockDashboardStats = {
  totalPilgrims: 2547,
  activeAgents: 89,
  ongoingTrips: 34,
  revenue: 1250000,
  donations: 89500
};

export const mockPilgrimsData = [
  { month: 'Jan', count: 45, completed: 40 },
  { month: 'Feb', count: 78, completed: 70 },
  { month: 'Mar', count: 120, completed: 115 },
  { month: 'Apr', count: 200, completed: 185 },
  { month: 'May', count: 350, completed: 320 },
  { month: 'Jun', count: 480, completed: 450 },
  { month: 'Jul', count: 520, completed: 500 },
  { month: 'Aug', count: 400, completed: 380 },
  { month: 'Sep', count: 290, completed: 280 },
  { month: 'Oct', count: 180, completed: 170 },
  { month: 'Nov', count: 95, completed: 90 },
  { month: 'Dec', count: 60, completed: 55 }
];

export const mockDonationsData = [
  { name: 'Zakat', value: 35000, color: '#FFD700' },
  { name: 'Sadaqah', value: 28000, color: '#B8860B' },
  { name: 'Fitrah', value: 16000, color: '#DAA520' },
  { name: 'General', value: 10500, color: '#CD853F' }
];

export const mockTravelAgents = [
  {
    id: 1,
    name: 'Al-Madinah Haji Travel',
    email: 'info@almadinahtravel.com',
    phone: '+966 12 345 6789',
    activePilgrims: 125,
    totalTrips: 8,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 2,
    name: 'Makkah Express Haji Tours',
    email: 'contact@makkahexpress.com',
    phone: '+966 11 987 6543',
    activePilgrims: 98,
    totalTrips: 6,
    rating: 4.6,
    status: 'active'
  },
  {
    id: 3,
    name: 'Sacred Haji Journey Ltd',
    email: 'hello@sacredjourney.com',
    phone: '+966 13 456 789',
    activePilgrims: 87,
    totalTrips: 5,
    rating: 4.9,
    status: 'active'
  }
];

export const mockPilgrimLocations = [
  {
    id: 1,
    name: 'Masjid al-Haram',
    lat: 21.4225,
    lng: 39.8262,
    type: 'mosque',
    pilgrimCount: 1250,
    description: 'The Great Mosque of Makkah'
  },
  {
    id: 2,
    name: 'Masjid an-Nabawi',
    lat: 24.4672,
    lng: 39.6117,
    type: 'mosque',
    pilgrimCount: 890,
    description: 'The Prophet\'s Mosque in Madinah'
  },
  {
    id: 3,
    name: 'King Abdulaziz International Airport',
    lat: 21.6796,
    lng: 39.1564,
    type: 'airport',
    pilgrimCount: 340,
    description: 'Jeddah Airport'
  },
  {
    id: 4,
    name: 'Prince Mohammad Airport',
    lat: 24.5535,
    lng: 39.7050,
    type: 'airport',
    pilgrimCount: 220,
    description: 'Madinah Airport'
  },
  {
    id: 5,
    name: 'Hilton Suites Makkah',
    lat: 21.4267,
    lng: 39.8178,
    type: 'hotel',
    pilgrimCount: 180,
    description: 'Hotel near Haram'
  },
  {
    id: 6,
    name: 'Dar Al Hijra Hotel',
    lat: 24.4692,
    lng: 39.6103,
    type: 'hotel',
    pilgrimCount: 150,
    description: 'Hotel in Madinah'
  }
];

export const mockRecentActivities = [
  {
    id: 1,
    type: 'registration',
    message: 'New pilgrim registered: Ahmed Al-Rashid',
    timestamp: '2025-01-15T10:30:00Z',
    icon: 'user-plus'
  },
  {
    id: 2,
    type: 'trip',
    message: 'Trip started: Makkah Express Tour Group 12',
    timestamp: '2025-01-15T09:15:00Z',
    icon: 'plane'
  },
  {
    id: 3,
    type: 'donation',
    message: 'New donation received: $2,500 Zakat',
    timestamp: '2025-01-15T08:45:00Z',
    icon: 'heart'
  },
  {
    id: 4,
    type: 'agent',
    message: 'Haji travel agent verified: Sacred Haji Journey Ltd',
    timestamp: '2025-01-15T07:20:00Z',
    icon: 'check-circle'
  },
  {
    id: 5,
    type: 'completion',
    message: 'Pilgrim completed Hajj: Fatima bint Omar',
    timestamp: '2025-01-14T18:30:00Z',
    icon: 'star'
  }
];

export const mockNotifications = [
  {
    id: 1,
    title: 'New Pilgrim Registration',
    message: '15 new pilgrims registered today',
    timestamp: '5 min ago',
    type: 'info',
    read: false
  },
  {
    id: 2,
    title: 'Payment Alert',
    message: 'Large donation received - $10,000',
    timestamp: '1 hour ago',
    type: 'success',
    read: false
  },
  {
    id: 3,
    title: 'System Update',
    message: 'Scheduled maintenance at 2 AM tomorrow',
    timestamp: '3 hours ago',
    type: 'warning',
    read: true
  }
];

export const mockUser = {
  name: 'Admin Muhammad',
  email: 'admin@findmyhaji.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  role: 'Super Admin'
};