import express from 'express';
import { body, validationResult } from 'express-validator';
import WebsiteContent from '../models/WebsiteContent.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get all website content
router.get('/admin/content', authenticate, authorize('1'), async (req, res) => {
  try {
    const content = await WebsiteContent.findAll();
    // Convert to object with section as key for easier frontend access
    const contentMap = {};
    content.forEach(item => {
      if(item.page_type === 'pricing') {
        contentMap[item.page_type] = {
          title: item.plans.title,
          subtitle: item.plans.subtitle,
          plans: item.plans.content.plans
        };
      }else{
        contentMap[item.page_type] = {
          title: item.plans === undefined ? item.title : item.plans.title,
          subtitle: item.plans === undefined ? item.subtitle : item.plans.subtitle,
          content: item.greeting,
          p_button_text: item.p_button_text,
          s_button_text: item.s_button_text,
          mission: item.mission,
          vision: item.vision
        };
      }
    });
    return res.json({
      success: 'success',
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

// Frontend route - Get website content for particular section
router.get('/content/:section', async (req, res) => {
  try {
    const page_type = req.params.section;
    let content;
    if(!['pricing'].includes(page_type)){
      content = await WebsiteContent.findOne({ page_type });
    } else {
      content = await WebsiteContent.findAllPricing();
    }

    return res.json({
      success: 'success',
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
const validateContentUpdate = [
   // HERO
  body('hero').exists().withMessage('Hero section is required'),
  body('hero.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Hero title is required (1-200 chars)'),
  body('hero.subtitle')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Hero subtitle is required (1-300 chars)'),

  // ABOUT
  body('about').exists().withMessage('About section is required'),
  body('about.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('About title is required'),
  body('about.subtitle')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('About subtitle is required'),
  body('about.content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('About content is required'),

  // MISSION
  body('mission').exists().withMessage('Mission section is required'),
  body('mission.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Mission title is required'),
  body('mission.subtitle')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Mission subtitle is required'),

  // PRICING
  body('pricing').exists().withMessage('Pricing section is required'),
  body('pricing.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Pricing title is required'),
  body('pricing.subtitle')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Pricing subtitle is required'),

  // PLANS
  body('pricing.plans')
    .isArray({ min: 1 })
    .withMessage('Pricing must include at least one plan'),

  body('pricing.plans.*.name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Plan name is required'),

  body('pricing.plans.*.price')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Plan price is required'),

  body('pricing.plans.*.period')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Plan period is required'),

  body('pricing.plans.*.features')
    .isArray({ min: 1 })
    .withMessage('Each plan must include at least one feature'),
  body('pricing.plans.*.features.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Feature text cannot be empty')
];
router.put('/admin/content', authenticate, authorize('1'), validateContentUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errorCount: errors.array().length,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      });
    }

    const result = await WebsiteContent.findOneAndUpdate(
      { contentData: req.body }
    );
    if (result === true) {
      return res.json({
        success: 'success',
        message: 'Website content updated successfully'
      });
    }else{
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

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