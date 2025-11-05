import express from 'express';
// import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import customerRoutes from './routes/customers.js';
import menu from './routes/menu.js';
import roleRoutes from './routes/roles.js';
import pilgrimsRoutes from './routes/pilgrims.js';
import groupsRoutes from './routes/groups.js';
import familyRoutes from './routes/family.js';
import trackingRoutes from './routes/tracking.js';
import analyticsRoutes from './routes/analytics.js';
import communicationRoutes from './routes/communication.js';
import emergencyRoutes from './routes/emergency.js';
import providersRoutes from './routes/providers.js';
import adminProvidersRoutes from './routes/admin-providers.js';
import contactsRoutes from './routes/contacts.js';
import websiteRoutes from './routes/website.js';
import blogsRoutes from './routes/blogs.js';
import notificationsRoutes from './routes/notifications.js';
import configurationsRoutes from './routes/configurations.js';
import paymentsRoutes from './routes/payments.js';
import firebaseRoutes from './routes/firebase.js';
import mapsRoutes from './routes/maps.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/findmyhaji';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://mecca-monitor.preview.emergentagent.com",
    "http://localhost:3000", // For local development
    "https://mecca-monitor.preview.emergentagent.com",
    "https://301b5fc1-9d13-4db3-8a6f-937681303e79.preview.emergentagent.com" // Backup domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Database connection
// mongoose.connect(MONGO_URL)
//   .then(() => {
//     console.log('🍃 Connected to MongoDB successfully');
//     console.log(`📍 Database: ${mongoose.connection.name}`);
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   });

// MongoDB connection events
// mongoose.connection.on('disconnected', () => {
//   console.log('🔴 MongoDB disconnected');
// });

// mongoose.connection.on('reconnected', () => {
//   console.log('🟢 MongoDB reconnected');
// });

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // Join operations room for real-time updates
  socket.join('operations-center');
  
  // Handle pilgrim location updates
  socket.on('pilgrim-location-update', (data) => {
    socket.to('operations-center').emit('live-location-update', data);
  });
  
  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    io.to('operations-center').emit('emergency-notification', data);
  });
  
  // Handle family message notifications
  socket.on('family-message-sent', (data) => {
    socket.to('operations-center').emit('family-message-notification', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '3.0.0',
    // database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve dynamic landing page on multiple routes
app.get('/public-landing', (req, res) => {
  const htmlPath = path.join(__dirname, 'public-landing.html');
  console.log('Attempting to serve landing page from:', htmlPath);
  res.sendFile(htmlPath, (err) => {
    if (err) {
      console.error('Error serving landing page:', err);
      res.status(500).json({ error: 'Landing page not found' });
    }
  });
});

// Working FindMyHaji Landing Page
app.get('/findmyhaji-website', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FindMyHaji - Your Pilgrimage. Connected.</title>
    <style>
        :root {
            --primary-green: #0f4c3a;
            --gold: #d4af37;
            --light-gold: #f7e98e;
            --beige: #f5f1eb;
            --cream: #faf8f3;
            --white: #ffffff;
            --dark-text: #1f2937;
            --medium-text: #4b5563;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.7;
            color: var(--dark-text);
            background: linear-gradient(135deg, var(--cream) 0%, var(--beige) 100%);
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .hero { min-height: 100vh; display: flex; align-items: center; position: relative; }
        .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-title { font-size: 3.5rem; font-weight: 800; color: var(--dark-text); margin-bottom: 1.5rem; line-height: 1.2; }
        .hero-subtitle { font-size: 1.25rem; color: var(--medium-text); margin-bottom: 2rem; }
        .hero-greeting { font-size: 1.125rem; color: var(--primary-green); margin-bottom: 1rem; font-weight: 700; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 1rem; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, var(--primary-green), #10b981); color: var(--white); }
        .btn-secondary { background: linear-gradient(135deg, var(--gold), var(--light-gold)); color: var(--primary-green); }
        .hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
        .kaaba-container { width: 300px; height: 300px; position: relative; margin: 0 auto; animation: float 3s ease-in-out infinite; }
        .kaaba { width: 120px; height: 120px; background: var(--primary-green); border-radius: 8px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .kaaba::before { content: ''; position: absolute; top: -5px; left: 10px; width: 100px; height: 20px; background: var(--gold); border-radius: 2px; }
        .pilgrim { position: absolute; width: 8px; height: 8px; background: var(--gold); border-radius: 50%; animation: tawaf 8s infinite linear; }
        .pilgrim:nth-child(1) { animation-delay: 0s; }
        .pilgrim:nth-child(2) { animation-delay: -2s; }
        .pilgrim:nth-child(3) { animation-delay: -4s; }
        .pilgrim:nth-child(4) { animation-delay: -6s; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes tawaf { 0% { transform: rotate(0deg) translateX(140px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        .section { padding: 4rem 0; }
        .section-title { font-size: 2.5rem; font-weight: 700; text-align: center; margin-bottom: 1rem; color: var(--primary-green); }
        .section-subtitle { font-size: 1.125rem; color: var(--medium-text); text-align: center; margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .about { background: var(--white); }
        .about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .feature-icons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .feature-icon { display: flex; flex-direction: column; align-items: center; padding: 1.5rem; background: var(--beige); border-radius: 12px; transition: all 0.3s ease; }
        .feature-icon:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .contact-form { max-width: 600px; margin: 0 auto; background: var(--white); padding: 2rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-text); }
        .form-input, .form-textarea { width: 100%; padding: 1rem; border: 2px solid var(--beige); border-radius: 8px; font-size: 1rem; transition: all 0.3s ease; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--primary-green); }
        .form-textarea { min-height: 120px; resize: vertical; }
        .footer { background: var(--primary-green); color: var(--white); padding: 3rem 0 2rem; }
        @media (max-width: 768px) {
            .hero-content, .about-content { grid-template-columns: 1fr; gap: 2rem; text-align: center; }
            .hero-title { font-size: 2.5rem; }
            .feature-icons { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <p class="hero-greeting">Assalāmu 'Alaikum wa Rahmatullāhi wa Barakātuh</p>
                    <h1 class="hero-title">Your Pilgrimage.<br>Connected.</h1>
                    <p class="hero-subtitle">Experience peace of mind during your sacred journey. Keep your loved ones informed and stay connected with real-time tracking, emergency assistance, and spiritual guidance.</p>
                    <div class="hero-buttons">
                        <a href="#" class="btn btn-primary">📱 Download on App Store</a>
                        <a href="#" class="btn btn-secondary">🤖 Get it on Google Play</a>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="kaaba-container">
                        <div class="kaaba"></div>
                        <div class="pilgrim"></div>
                        <div class="pilgrim"></div>
                        <div class="pilgrim"></div>
                        <div class="pilgrim"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="section about">
        <div class="container">
            <h2 class="section-title">What is FindMyHaji?</h2>
            <p class="section-subtitle">Connecting hearts and souls across distances during the most sacred journey of a lifetime.</p>
            
            <div class="about-content">
                <div class="about-text">
                    <h3 style="font-size: 2rem; color: var(--primary-green); margin-bottom: 1.5rem; font-weight: 700;">Bridging Distance with Technology</h3>
                    <p style="margin-bottom: 1.5rem; font-size: 1.125rem; color: var(--medium-text);">FindMyHaji was born from a simple yet profound need – keeping families connected during Hajj and Umrah. When millions gather in the holy cities, staying in touch with loved ones becomes both crucial and challenging.</p>
                    <p style="margin-bottom: 1.5rem; font-size: 1.125rem; color: var(--medium-text);">Our platform serves three communities: pilgrims seeking guidance and safety, families yearning for updates from their loved ones, and service providers managing groups with care and responsibility.</p>
                    <a href="#contact" class="btn btn-primary">Learn More</a>
                </div>
                
                <div class="about-visual">
                    <div class="feature-icons">
                        <div class="feature-icon">
                            <div style="width: 40px; height: 40px; color: var(--primary-green); margin-bottom: 1rem; font-size: 2rem;">📍</div>
                            <h4 style="font-size: 0.875rem; font-weight: 600; text-align: center; color: var(--dark-text);">Real-time GPS Tracking</h4>
                        </div>
                        <div class="feature-icon">
                            <div style="width: 40px; height: 40px; color: var(--primary-green); margin-bottom: 1rem; font-size: 2rem;">🆘</div>
                            <h4 style="font-size: 0.875rem; font-weight: 600; text-align: center; color: var(--dark-text);">Emergency SOS</h4>
                        </div>
                        <div class="feature-icon">
                            <div style="width: 40px; height: 40px; color: var(--primary-green); margin-bottom: 1rem; font-size: 2rem;">👥</div>
                            <h4 style="font-size: 0.875rem; font-weight: 600; text-align: center; color: var(--dark-text);">Group Management</h4>
                        </div>
                        <div class="feature-icon">
                            <div style="width: 40px; height: 40px; color: var(--primary-green); margin-bottom: 1rem; font-size: 2rem;">📧</div>
                            <h4 style="font-size: 0.875rem; font-weight: 600; text-align: center; color: var(--dark-text);">Family Updates</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="section" id="contact" style="background: var(--beige);">
        <div class="container">
            <h2 class="section-title">Contact Us</h2>
            <p class="section-subtitle">We're here to help with your pilgrimage journey</p>
            
            <div class="contact-form">
                <form id="contactForm">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input type="text" class="form-input" id="contactName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address *</label>
                        <input type="email" class="form-input" id="contactEmail" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject *</label>
                        <input type="text" class="form-input" id="contactSubject" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message *</label>
                        <textarea class="form-textarea" id="contactMessage" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        📩 Send Message
                    </button>
                    
                    <div id="successMessage" style="background: #d1fae5; color: #065f46; padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none;">
                        ✅ Thank you! Your message has been sent successfully. We'll respond within 24 hours, InshAllah.
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div style="text-align: center;">
                <h3 style="font-size: 2rem; margin-bottom: 1rem; color: var(--light-gold);">🕌 FindMyHaji</h3>
                <p style="margin-bottom: 2rem;">Connecting hearts and souls during the most sacred journey of a lifetime.</p>
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
                    <a href="#" class="btn btn-secondary">📱 Download for iOS</a>
                    <a href="#" class="btn btn-secondary">🤖 Download for Android</a>
                </div>
                <p style="opacity: 0.7;">&copy; 2024 FindMyHaji. All rights reserved. Built with ❤️ to serve the pilgrims of Allah.</p>
            </div>
        </div>
    </footer>

    <script>
        // Contact form functionality
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Sending...';
            
            try {
                const response = await fetch('/api/contacts/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('successMessage').style.display = 'block';
                    this.reset();
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong. Please try again.'));
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                alert('Network error. Please check your connection and try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    </script>
</body>
</html>`);
});

// User-friendly website route
app.get('/website', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const htmlPath = path.join(__dirname, '../frontend/public/index-dynamic.html');
  
  // Try to serve the static file first
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dynamic landing page:', err);
      // Fallback to embedded HTML
      res.send(getEmbeddedLandingPageHTML());
    } else {
      res.send(data);
    }
  });
});

// Alternative landing route
app.get('/landing', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const htmlPath = path.join(__dirname, '../frontend/public/index-dynamic.html');
  
  // Try to serve the static file first
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dynamic landing page:', err);
      // Fallback to embedded HTML
      res.send(getEmbeddedLandingPageHTML());
    } else {
      res.send(data);
    }
  });
});

// Function to get embedded HTML (fallback)
function getEmbeddedLandingPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FindMyHaji - Your Pilgrimage. Connected.</title>
    <style>
        :root {
            --primary-green: #0f4c3a;
            --gold: #d4af37;
            --light-gold: #f7e98e;
            --beige: #f5f1eb;
            --cream: #faf8f3;
            --white: #ffffff;
            --dark-text: #1f2937;
            --medium-text: #4b5563;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.7;
            color: var(--dark-text);
            background: linear-gradient(135deg, var(--cream) 0%, var(--beige) 100%);
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .hero { min-height: 100vh; display: flex; align-items: center; position: relative; }
        .hero-content { text-align: center; }
        .hero-title { font-size: 3.5rem; font-weight: 800; color: var(--dark-text); margin-bottom: 1.5rem; }
        .hero-subtitle { font-size: 1.25rem; color: var(--medium-text); margin-bottom: 2rem; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; }
        .btn-primary { background: linear-gradient(135deg, var(--primary-green), #10b981); color: var(--white); }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">🕌 FindMyHaji</h1>
                <p class="hero-subtitle">Your Pilgrimage. Connected.</p>
                <p>Experience peace of mind during your sacred journey with real-time tracking and family connection.</p>
                <br>
                <a href="/api/landing-page" class="btn btn-primary">🔗 View Full Website</a>
            </div>
        </div>
    </section>
</body>
</html>`;
}

// Simple landing page test
app.get('/test-landing', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>FindMyHaji Test Landing</title>
    </head>
    <body>
        <h1>FindMyHaji Landing Page Test</h1>
        <p>This is a test to ensure the landing page route is working.</p>
        <p>The full landing page is available at: <a href="/findmyhaji-website">/findmyhaji-website</a></p>
    </body>
    </html>
  `);
});

// Working FindMyHaji Landing Page (API route that bypasses frontend routing)
app.get('/api/landing-page', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const htmlPath = path.join(__dirname, '../frontend/public/index-dynamic.html');
  
  // Try to serve the static file first
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dynamic landing page:', err);
      // Fallback to embedded HTML
      res.send(getEmbeddedLandingPageHTML());
    } else {
      res.send(data);
    }
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menu);
app.use('/api/auth', authRoutes);
app.use('/api/pilgrims', pilgrimsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/admin/providers', adminProvidersRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/configurations', configurationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/firebase', firebaseRoutes);
app.use('/api/maps', mapsRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'FindMyHaji Operations Center API v3.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      users: '/api/users',
      roles: '/api/roles',
      pilgrims: '/api/pilgrims',
      groups: '/api/groups',
      family: '/api/family',
      tracking: '/api/tracking',
      analytics: '/api/analytics',
      communication: '/api/communication',
      emergency: '/api/emergency',
      providers: '/api/providers',
      adminProviders: '/api/admin/providers',
      contacts: '/api/contacts',
      website: '/api/website'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('🕋 FindMyHaji Operations Center Backend Started');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔄 Socket.IO: http://localhost:${PORT}`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${MONGO_URL}`);
  console.log('\n═══════════════════════════════════════════════');
  console.log('🙏 Bismillah - Serving the pilgrims of Allah\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('🔴 Server closed');
    // mongoose.connection.close(false, () => {
    //   console.log('🍃 MongoDB connection closed');
    //   process.exit(0);
    // });
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('🔴 Server closed');
    // mongoose.connection.close(false, () => {
    //   console.log('🍃 MongoDB connection closed');
    //   process.exit(0);
    // });
  });
});

export default app;