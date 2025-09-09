import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import { authenticateAdmin, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/providers
// @desc    Get all providers with filtering and pagination
// @access  Private (Admin only)
router.get('/', authenticateAdmin, requirePermission('provider_management'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'suspended']).withMessage('Invalid status'),
  query('zone').optional().isIn(['Makkah', 'Madinah', 'Jeddah', 'Riyadh', 'Dammam', 'Other']).withMessage('Invalid zone'),
  query('businessType').optional().isIn([
    'Travel Agent', 'Tour Operator', 'Transportation Provider', 
    'Accommodation Provider', 'Guide Service', 'Food Service', 'Other Services'
  ]).withMessage('Invalid business type')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.zone) filter.zone = req.query.zone;
    if (req.query.businessType) filter.businessType = req.query.businessType;
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get providers with pagination
    const providers = await Provider.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Provider.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get summary statistics
    const stats = await Provider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      suspended: stats.find(s => s._id === 'suspended')?.count || 0
    };

    res.json({
      success: true,
      data: {
        providers: providers.map(p => p.toSafeObject()),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/providers/:id
// @desc    Get single provider details
// @access  Private (Admin only)
router.get('/:id', authenticateAdmin, requirePermission('provider_management'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ id: req.params.id }).select('-password');
    
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
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/providers/:id/approve
// @desc    Approve provider application
// @access  Private (Admin only)
router.put('/:id/approve', authenticateAdmin, requirePermission('provider_management'), [
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
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

    const provider = await Provider.findOne({ id: req.params.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Provider is already approved'
      });
    }

    // Update provider status
    provider.status = 'approved';
    provider.approvedBy = req.user.id;
    provider.approvedAt = new Date();
    
    if (req.body.notes) {
      provider.notes = provider.notes || [];
      provider.notes.push({
        message: `Approved: ${req.body.notes}`,
        createdBy: req.user.id,
        createdAt: new Date()
      });
    }

    await provider.save();

    // Create corresponding User account
    const user = new User({
      email: provider.email,
      password: provider.password, // Already hashed
      role: 'provider',
      providerProfile: provider._id,
      profile: {
        firstName: provider.firstName,
        lastName: provider.lastName,
        phone: provider.formattedPhone
      },
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Provider approved successfully',
      data: provider.toSafeObject()
    });

    // TODO: Send approval email to provider

  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/providers/:id/reject
// @desc    Reject provider application
// @access  Private (Admin only)
router.put('/:id/reject', authenticateAdmin, requirePermission('provider_management'), [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const provider = await Provider.findOne({ id: req.params.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Provider is already rejected'
      });
    }

    // Update provider status
    provider.status = 'rejected';
    provider.rejectionReason = req.body.reason;
    
    provider.notes = provider.notes || [];
    provider.notes.push({
      message: `Rejected: ${req.body.reason}`,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await provider.save();

    res.json({
      success: true,
      message: 'Provider rejected',
      data: provider.toSafeObject()
    });

    // TODO: Send rejection email to provider

  } catch (error) {
    console.error('Reject provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/providers/:id/suspend
// @desc    Suspend provider account
// @access  Private (Admin only)
router.put('/:id/suspend', authenticateAdmin, requirePermission('provider_management'), [
  body('reason').trim().notEmpty().withMessage('Suspension reason is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const provider = await Provider.findOne({ id: req.params.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Update provider status
    provider.status = 'suspended';
    provider.isActive = false;
    
    provider.notes = provider.notes || [];
    provider.notes.push({
      message: `Suspended: ${req.body.reason}`,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await provider.save();

    // Also deactivate User account if exists
    await User.updateOne(
      { email: provider.email, role: 'provider' },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Provider suspended',
      data: provider.toSafeObject()
    });

  } catch (error) {
    console.error('Suspend provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/providers/:id/reactivate
// @desc    Reactivate suspended provider
// @access  Private (Admin only)
router.put('/:id/reactivate', authenticateAdmin, requirePermission('provider_management'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ id: req.params.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Only suspended providers can be reactivated'
      });
    }

    // Update provider status
    provider.status = 'approved';
    provider.isActive = true;
    
    provider.notes = provider.notes || [];
    provider.notes.push({
      message: 'Account reactivated',
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await provider.save();

    // Also reactivate User account if exists
    await User.updateOne(
      { email: provider.email, role: 'provider' },
      { isActive: true }
    );

    res.json({
      success: true,
      message: 'Provider reactivated',
      data: provider.toSafeObject()
    });

  } catch (error) {
    console.error('Reactivate provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/providers/pending/count
// @desc    Get count of pending provider applications
// @access  Private (Admin only)
router.get('/pending/count', authenticateAdmin, requirePermission('provider_management'), async (req, res) => {
  try {
    const pendingCount = await Provider.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      data: {
        pendingCount,
        hasNewApplications: pendingCount > 0
      }
    });

  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;