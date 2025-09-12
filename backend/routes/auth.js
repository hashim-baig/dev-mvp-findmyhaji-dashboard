import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dbPool from '../db.js';

const router = express.Router();

// Mock admin users (in production, this would be in database)
const mockAdmins = [
  {
    id: '1',
    name: 'Khazi Naseeruddin',
    email: 'admin@findmyhaji.com',
    password: '$2b$10$Xk6P6P7jwHTE8G9fCkZ0XOoFMPWAdJXo3kXjPUxTZZ7M1eG0TtM4a', // password
    role: 'admin',
    displayRole: 'Operations Director',
    location: 'Makkah Control Center',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Admin Muhammad',
    email: 'admin2@findmyhaji.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    displayRole: 'Super Admin',
    location: 'Operations Center',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({
    //     error: 'Validation failed',
    //     details: errors.array()
    //   });
    // }

    const { email, password } = req.body;
    // Find admin user
    const result = await dbPool.query(
        "SELECT * FROM users WHERE email = $1 AND role = 1 LIMIT 1",
        [email]
      );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    // 🔹 Compare password (must be hashed in DB!)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'findmyhaji_secret_key',
      { expiresIn: '24h' }
    );
    const role_result = await dbPool.query(
        "SELECT name FROM roles WHERE id = $1 LIMIT 1",
        [user.role]
      );
    const role_data = role_result.rows[0];
    res.json({
      status:'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.firstname + ' ' + user.lastname,
        email: user.email,
        role: role_data.name,
        location: user.location,
        // avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
// router.get('/verify', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret_key');
//     const admin = mockAdmins.find(user => user.id === decoded.id);

//     if (!admin) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     res.json({
//       valid: true,
//       user: {
//         id: admin.id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//         location: admin.location,
//         avatar: admin.avatar
//       }
//     });
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// });


export default router;