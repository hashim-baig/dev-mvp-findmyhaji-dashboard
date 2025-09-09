import express from 'express';
import { body, validationResult } from 'express-validator';
import WebsiteContent from '../models/WebsiteContent.js';

const router = express.Router();

// Public route - Get all website content
router.get('/content', async (req, res) => {
  try {
    const content = await WebsiteContent.find({ isActive: true })
      .select('section title subtitle content')
      .lean();

    // Convert to object with section as key for easier frontend access
    const contentMap = {};
    content.forEach(item => {
      contentMap[item.section] = {
        title: item.title,
        subtitle: item.subtitle,
        content: item.content
      };
    });

    res.json({
      success: true,
      data: contentMap
    });

  } catch (error) {
    console.error('Error fetching website content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching website content'
    });
  }
});

// Admin route - Get all website content for management
router.get('/admin/content', async (req, res) => {
  try {
    const content = await WebsiteContent.find()
      .sort({ section: 1 })
      .lean();

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Error fetching website content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching website content'
    });
  }
});

// Admin route - Update website content
router.put('/admin/content/:section', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1-200 characters'),
  body('subtitle').optional().trim().isLength({ max: 300 }).withMessage('Subtitle must be less than 300 characters'),
  body('content').isObject().withMessage('Content must be an object'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, subtitle, content, isActive } = req.body;
    const section = req.params.section;

    const updateData = {
      section,
      title,
      subtitle: subtitle || '',
      content,
      isActive: isActive !== undefined ? isActive : true,
      lastUpdatedBy: 'admin' // In real app, get from authenticated user
    };

    const websiteContent = await WebsiteContent.findOneAndUpdate(
      { section },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Website content updated successfully',
      data: websiteContent
    });

  } catch (error) {
    console.error('Error updating website content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating website content'
    });
  }
});

// Admin route - Initialize default content
router.post('/admin/content/initialize', async (req, res) => {
  try {
    const defaultContent = [
      {
        section: 'hero',
        title: 'Your Pilgrimage. Connected.',
        subtitle: 'Experience peace of mind during your sacred journey. Keep your loved ones informed and stay connected with real-time tracking, emergency assistance, and spiritual guidance.',
        content: {
          greeting: 'Assalāmu \'Alaikum wa Rahmatullāhi wa Barakātuh',
          primaryButton: 'Download App',
          secondaryButton: 'Learn More'
        },
        createdBy: 'system',
        lastUpdatedBy: 'system'
      },
      {
        section: 'about',
        title: 'What is FindMyHaji?',
        subtitle: 'Connecting hearts and souls across distances during the most sacred journey of a lifetime.',
        content: {
          description: 'FindMyHaji was born from a simple yet profound need – keeping families connected during Hajj and Umrah. When millions gather in the holy cities, staying in touch with loved ones becomes both crucial and challenging.',
          features: [
            { name: 'Real-time GPS Tracking', icon: 'map-pin' },
            { name: 'Emergency SOS', icon: 'alert-triangle' },
            { name: 'Group Management', icon: 'users' },
            { name: 'Family Updates', icon: 'message-circle' }
          ]
        },
        createdBy: 'system',
        lastUpdatedBy: 'system'
      },
      {
        section: 'mission',
        title: 'Our Mission & Vision',
        subtitle: 'Guided by faith, empowered by technology',
        content: {
          mission: 'To provide peace of mind to pilgrims and their families through innovative technology, ensuring safety, connectivity, and spiritual focus during the sacred journey of Hajj and Umrah.',
          vision: 'To be the most trusted companion for Muslim pilgrims worldwide, bridging the gap between spiritual devotion and practical safety through seamless, respectful technology solutions.'
        },
        createdBy: 'system',
        lastUpdatedBy: 'system'
      },
      {
        section: 'pricing',
        title: 'Subscription Plans',
        subtitle: 'Affordable access for every pilgrim',
        content: {
          plans: [
            {
              name: 'Individual Pilgrim',
              price: '₹0',
              period: 'Free for life',
              features: [
                'GPS location tracking',
                'Emergency SOS alerts',
                'Basic ritual checklist',
                'Prayer times & Qibla',
                'Family updates',
                'Essential safety features'
              ]
            },
            {
              name: 'Group Access',
              price: '₹199',
              period: 'Per trip (one-time)',
              featured: true,
              features: [
                'All Individual features',
                'Group management tools',
                'Real-time group tracking',
                'Instant group communication',
                'Advanced emergency coordination',
                'Itinerary management',
                'Group photos & memories',
                'Priority support'
              ]
            }
          ]
        },
        createdBy: 'system',
        lastUpdatedBy: 'system'
      }
    ];

    // Initialize default content if not exists
    for (const contentItem of defaultContent) {
      await WebsiteContent.findOneAndUpdate(
        { section: contentItem.section },
        contentItem,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Default website content initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing website content:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing website content'
    });
  }
});

export default router;