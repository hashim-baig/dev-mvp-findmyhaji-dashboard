import express from 'express';
import Blog from '../models/Blog.js';
import BlogComment from '../models/BlogComment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'blogs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `blog-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ===== PUBLIC BLOG ROUTES =====

// GET /api/blogs - Get published blogs (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      tag,
      featured,
      sort = 'newest'
    } = req.query;

    const query = { status: 'published' };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Filter featured posts
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { publishedAt: -1 };
        break;
      case 'oldest':
        sortOptions = { publishedAt: 1 };
        break;
      case 'popular':
        sortOptions = { viewCount: -1, publishedAt: -1 };
        break;
      case 'trending':
        sortOptions = { likes: -1, viewCount: -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .select('id title slug excerpt coverImage author category tags publishedAt readTime viewCount likes featured')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalBlogs / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// GET /api/blogs/featured - Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const featuredBlogs = await Blog.find({
      status: 'published',
      featured: true
    })
    .select('id title slug excerpt coverImage author category publishedAt readTime viewCount')
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();
    
    res.json({
      success: true,
      data: featuredBlogs
    });
    
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured blogs',
      error: error.message
    });
  }
});

// GET /api/blogs/categories - Get all categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const categoryMap = {
      rituals: 'Rituals & Worship',
      safety: 'Safety & Security',
      family: 'Family & Groups',
      duas: 'Duas & Prayers',
      provider_tips: 'Provider Tips',
      packing: 'Packing & Preparation',
      travel: 'Travel & Transportation',
      spiritual_guidance: 'Spiritual Guidance',
      news: 'News & Updates',
      general: 'General'
    };
    
    const formattedCategories = categories.map(cat => ({
      value: cat._id,
      label: categoryMap[cat._id] || cat._id,
      count: cat.count
    }));
    
    res.json({
      success: true,
      data: formattedCategories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET /api/blogs/:slug - Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find blog by slug or by URL ID format (slug-id)
    let blog;
    if (slug.includes('-') && slug.length > 20) {
      // Extract ID from slug-id format
      const parts = slug.split('-');
      const id = parts[parts.length - 1];
      blog = await Blog.findOne({
        $or: [
          { slug: slug },
          { id: { $regex: id + '$' } }
        ],
        status: 'published'
      }).lean();
    } else {
      blog = await Blog.findOne({ 
        slug, 
        status: 'published' 
      }).lean();
    }
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Increment view count
    await Blog.findOneAndUpdate(
      { id: blog.id },
      { $inc: { viewCount: 1 } }
    );
    
    // Get related blogs
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'published',
      id: { $ne: blog.id }
    })
    .select('id title slug excerpt coverImage category publishedAt readTime')
    .sort({ publishedAt: -1 })
    .limit(4)
    .lean();
    
    res.json({
      success: true,
      data: {
        blog: { ...blog, viewCount: blog.viewCount + 1 },
        relatedBlogs
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

// ===== ADMIN BLOG ROUTES =====

// GET /api/blogs/admin/all - Get all blogs for admin
router.get('/admin/all', authenticate, authorize('admin', 'content_manager'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'views':
        sortOptions = { viewCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalBlogs / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// POST /api/blogs/admin/create - Create new blog
router.post('/admin/create', authenticate, authorize('admin', 'content_manager'), upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status = 'draft',
      featured = false,
      metaTitle,
      metaDescription,
      keywords,
      scheduledAt
    } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, content, and category are required'
      });
    }

    // Parse tags if it's a string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Parse keywords if it's a string
    let parsedKeywords = [];
    if (keywords) {
      parsedKeywords = typeof keywords === 'string' ? keywords.split(',').map(kw => kw.trim()) : keywords;
    }

    // Handle cover image
    let coverImagePath = '';
    if (req.file) {
      coverImagePath = `/uploads/blogs/${req.file.filename}`;
    }

    const blogData = {
      title,
      excerpt,
      content,
      category,
      tags: parsedTags,
      status,
      featured: featured === 'true' || featured === true,
      coverImage: coverImagePath,
      author: {
        id: req.user.id,
        name: req.user.name || req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
        role: req.user.role
      },
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords: parsedKeywords
      }
    };

    if (scheduledAt) {
      blogData.scheduledAt = new Date(scheduledAt);
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });

  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
});

// PUT /api/blogs/admin/:id - Update blog
router.put('/admin/:id', authenticate, authorize('admin', 'content_manager'), upload.single('coverImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      featured,
      metaTitle,
      metaDescription,
      keywords
    } = req.body;

    const blog = await Blog.findOne({ id });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Parse tags and keywords
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    let parsedKeywords = [];
    if (keywords) {
      parsedKeywords = typeof keywords === 'string' ? keywords.split(',').map(kw => kw.trim()) : keywords;
    }

    // Handle cover image
    if (req.file) {
      // Delete old image if exists
      if (blog.coverImage) {
        const oldImagePath = path.join(process.cwd(), blog.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Update fields
    if (title) blog.title = title;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (parsedTags.length > 0) blog.tags = parsedTags;
    if (status) blog.status = status;
    if (featured !== undefined) blog.featured = featured === 'true' || featured === true;

    // Update SEO
    blog.seo = {
      metaTitle: metaTitle || blog.title,
      metaDescription: metaDescription || blog.excerpt,
      keywords: parsedKeywords.length > 0 ? parsedKeywords : blog.seo?.keywords || []
    };

    await blog.save();

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
});

// DELETE /api/blogs/admin/:id - Delete blog
router.delete('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ id });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete cover image if exists
    if (blog.coverImage) {
      const imagePath = path.join(process.cwd(), blog.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete related comments
    await BlogComment.deleteMany({ blogId: blog.id });

    // Delete blog
    await Blog.deleteOne({ id });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
});

// GET /api/blogs/admin/stats - Get blog statistics
router.get('/admin/stats', authenticate, authorize('admin', 'content_manager'), async (req, res) => {
  try {
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalLikes,
      categoryStats
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]),
      Blog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        archivedBlogs: totalBlogs - publishedBlogs - draftBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
      error: error.message
    });
  }
});

export default router;