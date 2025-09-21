import express from 'express';
import Menu from '../models/Menu.js';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// GET /api/menus - Get all menus
router.get('/', authenticate, authorize('1') ,async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
    
    const sideMenus = await Menu.findAllMenuSubmenu(decoded.role);
    res.json({
      success: 'success',
      data: sideMenus
    });
    
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
});


export default router;