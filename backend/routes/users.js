import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { getISTISOString } from '../services/helper.js';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', authenticate, authorize('1') ,async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: 'success',
      data: users
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});
// GET /api/users - Get all users with pagination
router.get('/pagination', authenticate, authorize('1') ,async (req, res) => {
  try {
    // Get page & limit from query params (default: page 1, limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    
    const result = await User.findWithPagination(search, offset, limit);
    const totalPages = Math.ceil(result.totalUsers / limit);

    res.json({
      users: result.rows,
      pagination: {
        totalUsers: result.totalUsers,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      success: 'success'
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});
//register start

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-image/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-image-' + uniqueSuffix + path.extname(file.originalname));
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
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  // body('confirmPassword').custom((value, { req }) => {
  //   if (value !== req.body.password) {
  //     throw new Error('Passwords do not match');
  //   }
  //   return value;
  // }),
  body('countryCode').notEmpty().withMessage('Country code is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
];
// @route   POST /api/users/register
// @desc    Register new user
router.post('/register', upload.single('profileImage'), registrationValidation ,async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({
        status: 'error',
        errors: errors.array()
      }); 
    }
      const {
        firstName, lastName, email, password, phone, role, countryCode
      } = req.body;
  
      // Check if user already exists with this email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'An account with this email already exists'
        });
      }
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // Create user
      const newUser = {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          mobile: countryCode + '-' + phone,
          role,
          created_at: getISTISOString(),
        };
        // Add avatar only if file is uploaded
        if (req.file) {
          newUser.avatar = `/uploads/profile-image/${req.file.filename}`;
        }
      const result = await User.save(newUser);
  
      res.status(201).json({
        status: 'success',
        message: 'User registration submitted successfully.',
        data: result
      });
  
    } catch (error) {
      console.error('User registration error:', error);
      
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
//register end

export default router;