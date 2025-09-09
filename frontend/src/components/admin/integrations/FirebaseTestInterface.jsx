import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FirebaseTestInterface = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenVerificationResult, setTokenVerificationResult] = useState(null);
  const [notificationResult, setNotificationResult] = useState(null);
  const [firestoreResult, setFirestoreResult] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/firebase/status`);
      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error checking Firebase status:', error);
    }
  };

  const testTokenVerification = async () => {
    const testToken = prompt('Enter Firebase ID Token to verify (or use "test_token" for demo):');
    if (!testToken) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/firebase/auth/verify-token`, {
        idToken: testToken
      });
      setTokenVerificationResult(response.data);
    } catch (error) {
      console.error('Error verifying token:', error);
      setTokenVerificationResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotificationSending = async () => {
    const deviceToken = prompt('Enter device token (or use "test_token" for demo):');
    if (!deviceToken) return;

    const title = prompt('Enter notification title:', 'Test Notification');
    const body = prompt('Enter notification body:', 'This is a test notification from FindMyHaji');

    if (!title || !body) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/firebase/messaging/send-to-device`, {
        token: deviceToken,
        title,
        body,
        data: {
          source: 'admin_test',
          timestamp: new Date().toISOString()
        }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotificationResult(response.data);
    } catch (error) {
      console.error('Error sending notification:', error);
      setNotificationResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreOperation = async () => {
    const collection = prompt('Enter collection name:', 'test_collection');
    const documentData = prompt('Enter document data (JSON):', '{"message": "Hello from FindMyHaji", "timestamp": "' + new Date().toISOString() + '"}');
    
    if (!collection || !documentData) return;

    setLoading(true);
    try {
      const parsedData = JSON.parse(documentData);
      const response = await axios.post(`${backendUrl}/api/firebase/firestore/${collection}`, parsedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFirestoreResult(response.data);
    } catch (error) {
      console.error('Error with Firestore operation:', error);
      setFirestoreResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getStorageDownloadURL = async () => {
    const filePath = prompt('Enter file path in Firebase Storage:', 'uploads/test-file.jpg');
    if (!filePath) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/firebase/storage/download-url/${filePath}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        alert(`Download URL: ${response.data.data.downloadURL}`);
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error getting download URL:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔥 Firebase Integration Testing</h2>
      
      {/* Firebase Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Firebase Service Status</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {status ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Configuration Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Authentication</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.services.auth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.services.auth ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Messaging</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.services.messaging ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.services.messaging ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Firestore</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.services.firestore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.services.firestore ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.services.storage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.services.storage ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading status...</p>
          )}
          <button
            onClick={checkFirebaseStatus}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Firebase Feature Testing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testTokenVerification}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-amber-50 hover:bg-amber-100 border-2 border-amber-200'
            }`}
          >
            <div className="text-amber-600 text-2xl mb-2">🔐</div>
            <h4 className="font-semibold text-gray-800">Token Verification</h4>
            <p className="text-sm text-gray-600">Test Firebase ID token verification</p>
          </button>

          <button
            onClick={testNotificationSending}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
            }`}
          >
            <div className="text-blue-600 text-2xl mb-2">📱</div>
            <h4 className="font-semibold text-gray-800">Push Notifications</h4>
            <p className="text-sm text-gray-600">Send test notification to device</p>
          </button>

          <button
            onClick={testFirestoreOperation}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-50 hover:bg-green-100 border-2 border-green-200'
            }`}
          >
            <div className="text-green-600 text-2xl mb-2">🗄️</div>
            <h4 className="font-semibold text-gray-800">Firestore Database</h4>
            <p className="text-sm text-gray-600">Test document creation in Firestore</p>
          </button>

          <button
            onClick={getStorageDownloadURL}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200'
            }`}
          >
            <div className="text-purple-600 text-2xl mb-2">📁</div>
            <h4 className="font-semibold text-gray-800">Cloud Storage</h4>
            <p className="text-sm text-gray-600">Get file download URL from Storage</p>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {(tokenVerificationResult || notificationResult || firestoreResult) && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Test Results</h3>
          
          {tokenVerificationResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🔐 Token Verification Result</h4>
              <div className={`p-3 rounded ${
                tokenVerificationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="text-sm font-mono">
                  {tokenVerificationResult.success 
                    ? `✅ Token verified for user: ${tokenVerificationResult.data?.email || tokenVerificationResult.data?.uid}`
                    : `❌ ${tokenVerificationResult.message}`
                  }
                </p>
              </div>
            </div>
          )}

          {notificationResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📱 Notification Send Result</h4>
              <div className={`p-3 rounded ${
                notificationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="text-sm font-mono">
                  {notificationResult.success 
                    ? `✅ Notification sent successfully. Message ID: ${notificationResult.data?.messageId}`
                    : `❌ ${notificationResult.message}`
                  }
                </p>
              </div>
            </div>
          )}

          {firestoreResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🗄️ Firestore Operation Result</h4>
              <div className={`p-3 rounded ${
                firestoreResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="text-sm font-mono">
                  {firestoreResult.success 
                    ? `✅ Document created successfully. ID: ${firestoreResult.data?.id}`
                    : `❌ ${firestoreResult.message}`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Configuration Required</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>To fully test Firebase integration, you need to configure:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Firebase Service Account Key in 3rd Party Configurations</li>
            <li>Firebase Project ID and Storage Bucket settings</li>
            <li>Valid Firebase ID tokens for authentication testing</li>
            <li>Device registration tokens for push notification testing</li>
          </ul>
          <p className="mt-2">
            Go to <strong>3rd Party Configurations → Firebase Auth Verification</strong> to set up the service account key.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestInterface;