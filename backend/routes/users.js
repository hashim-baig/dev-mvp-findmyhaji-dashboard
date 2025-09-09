import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

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

export default router;