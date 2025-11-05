import express from 'express';
import Menu from '../models/Menu.js';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// GET /api/menus - Get all menus
router.get('/sidemenu', authenticate, authorize('1') ,async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
    
    const sideMenus = await Menu.findAllMenuSubmenu(decoded.role);
    return res.json({
      success: 'success',
      data: sideMenus
    });
    
  } catch (error) {
    console.error('Error fetching menus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching menus',
      error: error.message
    });
  }
});
// GET /api/menus - Get all menus
router.get('/:roleId', authenticate, authorize('1') ,async (req, res) => {
  try {
    const roleId = req.params.roleId.replace(':','');
    const checkMenuForRole = await Menu.checkMenuForRole(roleId);
    if (checkMenuForRole.length > 0) {
      return res.status(200).json({
        success: 'success',
        isSuperAdmin:false,
        data: checkMenuForRole
      });
    }
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findmyhaji_secret');
      if(decoded.role === 1){
      const menus = await Menu.findAll(decoded.role);
      return res.status(200).json({
        success: 'success',
        isSuperAdmin:true,
        data: menus
      });
    }
    return res.status(500).json({
      success: false,
      message: 'No roles found'
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching menus',
      error: error.message
    });
  }
});
const permissionValidation = [
  body("data")
    .custom((value) => {
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        throw new Error("Invalid JSON format");
      }

      if (!Array.isArray(parsed.data)) {
        throw new Error("data must be an array");
      }

      parsed.data.forEach((item, index) => {
        if (typeof item.id !== "number") {
          throw new Error(`id must be a number at index ${index}`);
        }
        if (!item.name || typeof item.name !== "string") {
          throw new Error(`name is required at index ${index}`);
        }
        ["list_permission", "add_permission", "update_permission", "delete_permission"].forEach(
          (key) => {
            if (![0, 1].includes(item[key])) {
              throw new Error(`${key} must be 0 or 1 at index ${index}`);
            }
          }
        );
      });

      if (typeof parsed.isSuperAdmin !== "boolean") {
        throw new Error("isSuperAdmin must be a boolean");
      }

      return true;
    }),
];
// PUT /api/menus/update - Update all menus
router.put('/update', authenticate, authorize('1'), permissionValidation, async (req, res) => {
  try {
    const { role } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }
    
    // Delete old menu
    await Menu.deleteMenuPermission(role);
    //parse string to json
    const parsedData = JSON.parse(req.body.data);
    //Create new menu
    const results = await Menu.save(parsedData,role);
    if(results != null){
      return res.status(200).json({
        success: 'success',
        results: results
      });
    }else{
      return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try after sometime!'
    });
    }
    
  } catch (error) {
    console.error('Error updating permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
});

export default router;