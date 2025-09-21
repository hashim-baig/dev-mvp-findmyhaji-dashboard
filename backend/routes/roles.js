import express from 'express';
import Role from '../models/Role.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// GET /api/roles - Get all roles
router.get('/', authenticate, authorize('1') ,async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    
    const roles = await Role.findAll(search);
    res.json({
      success: 'success',
      data: roles
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
// Validation rules
const registrationValidation = [
  body('name').trim().notEmpty().withMessage('Role is required')
];
// @route   POST /api/roles/store
// @desc    Register new role
router.post('/store', authenticate, authorize('1') , registrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({
        status: 'error',
        errors: errors.array()
      }); 
    }
    const { name } = req.body;
    // Check if user already exists with this email
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(409).json({
        status: 'error',
        message: 'Role with the same name already exists'
      });
    }

    const roleData = {
      name
    };
    const result = await Role.save(roleData);
    res.json({
      success: 'success',
      message: 'Role registered successfully',
      data: result
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
// Validation rules
const updateValidation = [
  body('id').trim().notEmpty().withMessage('Id is required'),
  body('name').trim().notEmpty().withMessage('Role name is required'),
];
// PUT /api/roles/update - Update role info
router.put('/update', authenticate, authorize('1'), updateValidation,async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({
        status: 'error',
        errors: errors.array()
      }); 
    }
    const { id, name } = req.body;
    // Check if user exists
    const userExistWithSameEmail = await Role.roleExistWithSameName({ name,id });
    if (userExistWithSameEmail) {
      return res.status(404).json({
        success: false,
        message: 'A role with this name already exists'
      });
    }
    const updateData = { name };
    const parsedId = parseInt(id);
    const where = { id:parsedId };
    // Update configuration in DB
    const result = await Role.update({ where, updateData });

    res.json({
      success: 'success',
      message: 'Role updated successfully',
      data: {
        results: result
      }
    });
    
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});
// DELETE /api/roles/delete/:id - Delete role
router.delete('/delete/:id', authenticate, authorize('1'), async (req, res) => {
  try {
    const { id } = req.params;
    // Check if user exists
    const user = await Role.findOne({ id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    //check if role is assigned to any user
    const isRoleAssigned = await Role.isRoleAssignedToAnyUser(id);
    if (isRoleAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role assigned to users'
      });
    }
    const parsedId = parseInt(id);
    // Delete role
    await Role.deleteOne(parsedId);

    res.json({
      success: 'success',
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
});

export default router;