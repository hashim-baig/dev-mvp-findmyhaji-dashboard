import express from 'express';
import firebaseService from '../services/firebase.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ===== AUTHENTICATION ROUTES =====

// POST /api/firebase/auth/verify-token - Verify Firebase ID token
router.post('/auth/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    
    const decodedToken = await firebaseService.verifyIdToken(idToken);
    
    res.json({
      success: true,
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        customClaims: decodedToken.customClaims || {}
      }
    });
    
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
});

// POST /api/firebase/auth/create-custom-token - Create custom token (admin only)
router.post('/auth/create-custom-token', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { uid, customClaims = {} } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }
    
    const customToken = await firebaseService.createCustomToken(uid, customClaims);
    
    res.json({
      success: true,
      data: {
        customToken,
        uid,
        customClaims
      }
    });
    
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom token',
      error: error.message
    });
  }
});

// GET /api/firebase/auth/user/:uid - Get user record (admin only)
router.get('/auth/user/:uid', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { uid } = req.params;
    
    const userRecord = await firebaseService.getUserRecord(uid);
    
    res.json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        metadata: userRecord.metadata,
        customClaims: userRecord.customClaims || {}
      }
    });
    
  } catch (error) {
    console.error('Error getting user record:', error);
    res.status(404).json({
      success: false,
      message: 'User not found',
      error: error.message
    });
  }
});

// POST /api/firebase/auth/create-user - Create user (admin only)
router.post('/auth/create-user', authenticate, authorize('admin'), async (req, res) => {
  try {
    const userData = req.body;
    
    const userRecord = await firebaseService.createUser(userData);
    
    res.json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// ===== MESSAGING ROUTES =====

// POST /api/firebase/messaging/send-to-device - Send notification to device
router.post('/messaging/send-to-device', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { token, title, body, data = {}, imageUrl } = req.body;
    
    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Token, title, and body are required'
      });
    }
    
    const payload = firebaseService.createNotificationPayload(title, body, data, imageUrl);
    const result = await firebaseService.sendToDevice(token, payload);
    
    res.json({
      success: true,
      data: {
        messageId: result,
        token,
        payload
      }
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// POST /api/firebase/messaging/send-to-devices - Send notification to multiple devices
router.post('/messaging/send-to-devices', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { tokens, title, body, data = {}, imageUrl } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array, title, and body are required'
      });
    }
    
    const payload = firebaseService.createNotificationPayload(title, body, data, imageUrl);
    const result = await firebaseService.sendToDevices(tokens, payload);
    
    res.json({
      success: true,
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        responses: result.responses,
        payload
      }
    });
    
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
});

// POST /api/firebase/messaging/send-to-topic - Send notification to topic
router.post('/messaging/send-to-topic', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { topic, title, body, data = {}, imageUrl } = req.body;
    
    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, title, and body are required'
      });
    }
    
    const payload = firebaseService.createNotificationPayload(title, body, data, imageUrl);
    const result = await firebaseService.sendToTopic(topic, payload);
    
    res.json({
      success: true,
      data: {
        messageId: result,
        topic,
        payload
      }
    });
    
  } catch (error) {
    console.error('Error sending topic notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send topic notification',
      error: error.message
    });
  }
});

// POST /api/firebase/messaging/subscribe-to-topic - Subscribe devices to topic
router.post('/messaging/subscribe-to-topic', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { tokens, topic } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array and topic are required'
      });
    }
    
    const result = await firebaseService.subscribeToTopic(tokens, topic);
    
    res.json({
      success: true,
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors,
        topic
      }
    });
    
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to topic',
      error: error.message
    });
  }
});

// ===== FIRESTORE ROUTES =====

// GET /api/firebase/firestore/:collection/:docId - Get document
router.get('/firestore/:collection/:docId', authenticate, async (req, res) => {
  try {
    const { collection, docId } = req.params;
    
    const document = await firebaseService.getDocument(collection, docId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
    
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
});

// POST /api/firebase/firestore/:collection - Add document
router.post('/firestore/:collection', authenticate, async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    
    const docId = await firebaseService.addDocument(collection, {
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    });
    
    res.json({
      success: true,
      data: {
        id: docId,
        collection
      }
    });
    
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add document',
      error: error.message
    });
  }
});

// PUT /api/firebase/firestore/:collection/:docId - Update document
router.put('/firestore/:collection/:docId', authenticate, async (req, res) => {
  try {
    const { collection, docId } = req.params;
    const data = req.body;
    
    await firebaseService.updateDocument(collection, docId, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    });
    
    res.json({
      success: true,
      data: {
        id: docId,
        collection
      }
    });
    
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// DELETE /api/firebase/firestore/:collection/:docId - Delete document
router.delete('/firestore/:collection/:docId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { collection, docId } = req.params;
    
    await firebaseService.deleteDocument(collection, docId);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// GET /api/firebase/firestore/:collection - Get collection
router.get('/firestore/:collection', authenticate, async (req, res) => {
  try {
    const { collection } = req.params;
    const { limit = 10, orderBy, orderDirection, whereField, whereOperator, whereValue } = req.query;
    
    let queryOptions = { limit: parseInt(limit) };
    
    if (orderBy) {
      queryOptions.orderBy = { field: orderBy, direction: orderDirection || 'asc' };
    }
    
    if (whereField && whereOperator && whereValue) {
      queryOptions.where = { field: whereField, operator: whereOperator, value: whereValue };
    }
    
    const documents = await firebaseService.getCollection(
      collection,
      queryOptions.limit,
      queryOptions.orderBy,
      queryOptions.where
    );
    
    res.json({
      success: true,
      data: documents
    });
    
  } catch (error) {
    console.error('Error getting collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collection',
      error: error.message
    });
  }
});

// ===== STORAGE ROUTES =====

// GET /api/firebase/storage/download-url/:filePath - Get download URL
router.get('/storage/download-url/*', authenticate, async (req, res) => {
  try {
    const filePath = req.params[0];
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }
    
    const downloadURL = await firebaseService.getDownloadURL(filePath);
    
    res.json({
      success: true,
      data: {
        downloadURL,
        filePath
      }
    });
    
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get download URL',
      error: error.message
    });
  }
});

// DELETE /api/firebase/storage/:filePath - Delete file
router.delete('/storage/*', authenticate, authorize('admin'), async (req, res) => {
  try {
    const filePath = req.params[0];
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }
    
    await firebaseService.deleteFile(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// GET /api/firebase/status - Check Firebase configuration status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: firebaseService.isConfigured(),
      services: {
        auth: firebaseService.auth !== null,
        messaging: firebaseService.messaging !== null,
        firestore: firebaseService.firestore !== null,
        storage: firebaseService.storage !== null
      }
    }
  });
});

export default router;