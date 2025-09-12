import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';

// General authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Admin-only authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Verify admin user exists and is active
    const user = await User.findOne({ id: decoded.id, role: 'admin', isActive: true });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or account not active'
      });
    }

    req.user = decoded;
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Provider-only authentication middleware
export const authenticateProvider = async (req, res, next) => {
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

    // Verify provider exists and is approved
    const provider = await Provider.findOne({ 
      id: decoded.id, 
      status: 'approved',
      isActive: true 
    });
    
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or account not active/approved'
      });
    }

    req.user = decoded;
    req.provider = provider;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(String(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required'
      });
    }

    try {
      const user = await User.findOne({ id: req.user.id });
      
      if (!user || !user.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Rate limiting by role
export const rateLimitByRole = (req, res, next) => {
  // Different rate limits based on user role
  const limits = {
    admin: { requests: 1000, window: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
    provider: { requests: 200, window: 15 * 60 * 1000 }, // 200 requests per 15 minutes
    customer: { requests: 100, window: 15 * 60 * 1000 }  // 100 requests per 15 minutes
  };

  const userRole = req.user?.role || 'customer';
  const limit = limits[userRole] || limits.customer;

  // Store rate limit info in req for express-rate-limit
  req.rateLimit = limit;
  next();
};