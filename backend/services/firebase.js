import admin from 'firebase-admin';
import ConfigurationSettings from '../models/ConfigurationSettings.js';

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.messaging = null;
    this.firestore = null;
    this.storage = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Get Firebase configuration from database
      const firebaseConfig = await ConfigurationSettings.getByCategory('firebase-auth');
      
      if (!firebaseConfig || !firebaseConfig.serviceAccountKey) {
        console.warn('Firebase configuration not found in database');
        return false;
      }

      // Parse service account key
      let serviceAccount;
      try {
        serviceAccount = typeof firebaseConfig.serviceAccountKey === 'string' 
          ? JSON.parse(firebaseConfig.serviceAccountKey)
          : firebaseConfig.serviceAccountKey;
      } catch (error) {
        console.error('Invalid Firebase service account key format:', error);
        return false;
      }

      // Initialize Firebase Admin if not already done
      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: firebaseConfig.storageBucket || `${serviceAccount.project_id}.appspot.com`,
          databaseURL: firebaseConfig.databaseURL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
        });
      } else {
        this.app = admin.app();
      }

      // Initialize services
      this.auth = admin.auth();
      this.messaging = admin.messaging();
      this.firestore = admin.firestore();
      this.storage = admin.storage();
      
      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      return false;
    }
  }

  // Authentication methods
  async verifyIdToken(idToken) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.verifyIdToken(idToken);
  }

  async createCustomToken(uid, additionalClaims = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.createCustomToken(uid, additionalClaims);
  }

  async getUserRecord(uid) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.getUser(uid);
  }

  async createUser(userData) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.createUser(userData);
  }

  async updateUser(uid, userData) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.updateUser(uid, userData);
  }

  async deleteUser(uid) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return await this.auth.deleteUser(uid);
  }

  // Push Notification methods
  async sendToDevice(registrationToken, payload, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized');
    }
    
    const message = {
      token: registrationToken,
      ...payload
    };
    
    return await this.messaging.send(message, options);
  }

  async sendToDevices(registrationTokens, payload, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized');
    }
    
    const message = {
      tokens: registrationTokens,
      ...payload
    };
    
    return await this.messaging.sendMulticast(message, options);
  }

  async sendToTopic(topic, payload, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized');
    }
    
    const message = {
      topic: topic,
      ...payload
    };
    
    return await this.messaging.send(message, options);
  }

  async subscribeToTopic(registrationTokens, topic) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized');
    }
    
    return await this.messaging.subscribeToTopic(registrationTokens, topic);
  }

  async unsubscribeFromTopic(registrationTokens, topic) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized');
    }
    
    return await this.messaging.unsubscribeFromTopic(registrationTokens, topic);
  }

  // Firestore methods
  async getDocument(collection, docId) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const doc = await this.firestore.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async setDocument(collection, docId, data, merge = true) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    return await this.firestore.collection(collection).doc(docId).set(data, { merge });
  }

  async addDocument(collection, data) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const docRef = await this.firestore.collection(collection).add(data);
    return docRef.id;
  }

  async updateDocument(collection, docId, data) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    return await this.firestore.collection(collection).doc(docId).update(data);
  }

  async deleteDocument(collection, docId) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    return await this.firestore.collection(collection).doc(docId).delete();
  }

  async getCollection(collection, limit = 10, orderBy = null, where = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }
    
    let query = this.firestore.collection(collection);
    
    if (where) {
      query = query.where(where.field, where.operator, where.value);
    }
    
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Storage methods
  async uploadFile(filePath, destination, metadata = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    const bucket = this.storage.bucket();
    const [file] = await bucket.upload(filePath, {
      destination,
      metadata
    });
    
    return file;
  }

  async getDownloadURL(filePath) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    const bucket = this.storage.bucket();
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2030'
    });
    
    return url;
  }

  async deleteFile(filePath) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    const bucket = this.storage.bucket();
    return await bucket.file(filePath).delete();
  }

  // Helper method to create notification payload
  createNotificationPayload(title, body, data = {}, imageUrl = null) {
    const payload = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    };
    
    if (imageUrl) {
      payload.notification.imageUrl = imageUrl;
    }
    
    return payload;
  }

  // Check if Firebase is properly configured
  isConfigured() {
    return this.initialized;
  }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;