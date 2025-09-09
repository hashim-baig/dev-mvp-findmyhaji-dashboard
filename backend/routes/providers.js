import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Provider from '../models/Provider.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/business-documents/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'business-doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and PDF files are allowed!'), false);
    }
  }
});

// Validation rules
const registrationValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return value;
  }),
  body('phone.countryCode').notEmpty().withMessage('Country code is required'),
  body('phone.number').notEmpty().withMessage('Phone number is required'),
  body('zone').isIn(['Makkah', 'Madinah', 'Jeddah', 'Riyadh', 'Dammam', 'Other']).withMessage('Valid zone is required'),
  body('businessType').isIn([
    'Travel Agent', 'Tour Operator', 'Transportation Provider', 
    'Accommodation Provider', 'Guide Service', 'Food Service', 'Other Services'
  ]).withMessage('Valid business type is required'),
  body('termsAccepted').equals('true').withMessage('You must accept the terms and conditions'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/providers/register
// @desc    Register new provider
// @access  Public
router.post('/register', upload.single('businessIdProof'), registrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName, lastName, email, password, phone, address,
      zone, businessType, termsAccepted
    } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(409).json({
        success: false,
        message: 'Provider with this email already exists'
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Check if business ID proof was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Business ID proof document is required'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create provider
    const provider = new Provider({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      zone,
      businessType,
      termsAccepted: termsAccepted === 'true',
      termsAcceptedAt: new Date(),
      businessIdProof: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date(),
        url: `/uploads/business-documents/${req.file.filename}`
      }
    });

    await provider.save();

    res.status(201).json({
      success: true,
      message: 'Provider registration submitted successfully. Please wait for approval.',
      data: {
        providerId: provider.id,
        email: provider.email,
        status: provider.status,
        submittedAt: provider.createdAt
      }
    });

  } catch (error) {
    console.error('Provider registration error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/providers/login
// @desc    Login provider
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find provider with email
    const provider = await Provider.findOne({ email }).select('+password');
    
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if provider is approved
    if (provider.status !== 'approved') {
      let message = 'Your account is pending approval';
      if (provider.status === 'rejected') {
        message = `Your account has been rejected. ${provider.rejectionReason || ''}`;
      } else if (provider.status === 'suspended') {
        message = 'Your account has been suspended. Please contact support.';
      }
      
      return res.status(403).json({
        success: false,
        message,
        status: provider.status
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, provider.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    provider.lastLoginAt = new Date();
    await provider.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: provider._id.toString(),
        providerId: provider.id || provider._id.toString(),
        email: provider.email,
        role: 'provider'
      },
      process.env.JWT_SECRET || 'findmyhaji_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        provider: provider.toSafeObject(),
        role: 'provider'
      }
    });

  } catch (error) {
    console.error('Provider login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/providers/profile
// @desc    Get provider profile
// @access  Private (Provider only)
router.get('/profile', authenticateProvider, async (req, res) => {
  try {
    const provider = await Provider.findOne({ 
      $or: [
        { id: req.provider.id },
        { _id: req.provider.id },
        { email: req.provider.email }
      ]
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      data: provider.toSafeObject()
    });

  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/providers/profile
// @desc    Update provider profile
// @access  Private (Provider only)
router.put('/profile', authenticateProvider, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone.number').optional().notEmpty().withMessage('Phone number cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const provider = await Provider.findOne({ 
      $or: [
        { id: req.provider.id },
        { _id: req.provider.id },
        { email: req.provider.email }
      ]
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(provider, updates);
    await provider.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: provider.toSafeObject()
    });

  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/providers/dashboard/stats
// @desc    Get provider dashboard statistics
// @access  Private (Provider only)
router.get('/dashboard/stats', authenticateProvider, async (req, res) => {
  try {
    const provider = await Provider.findOne({ 
      $or: [
        { id: req.provider.id },
        { _id: req.provider.id },
        { email: req.provider.email }
      ]
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const stats = {
      totalBookings: provider.statistics.totalBookings,
      completedBookings: provider.statistics.completedBookings,
      cancelledBookings: provider.statistics.cancelledBookings,
      pendingBookings: provider.statistics.totalBookings - provider.statistics.completedBookings - provider.statistics.cancelledBookings,
      earnings: {
        total: provider.earnings.total,
        pending: provider.earnings.pending,
        paid: provider.earnings.paid
      },
      rating: {
        average: provider.ratings.average,
        count: provider.ratings.count
      },
      activeServices: provider.services.filter(service => service.active).length,
      totalServices: provider.services.length,
      accountStatus: provider.status,
      joinedAt: provider.createdAt,
      lastLogin: provider.lastLoginAt
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Authentication middleware for providers
async function authenticateProvider(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
    
    if (decoded.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider role required.'
      });
    }

    const provider = await Provider.findOne({ 
      $or: [
        { id: decoded.id },
        { id: decoded.providerId },
        { email: decoded.email }
      ]
    });
    
    if (!provider || provider.status !== 'approved' || !provider.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or account not active'
      });
    }

    req.provider = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

export default router;