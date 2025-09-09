import React, { useState, useEffect } from 'react';
import { Bell, Upload, FileText, Save, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const FirebaseNotificationConfig = ({ onSave, loading, category }) => {
  const [activeTab, setActiveTab] = useState('file-upload');
  const [config, setConfig] = useState({
    apiKey: '',
    projectId: '',
    authDomain: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    enabled: false
  });
  const [fileContent, setFileContent] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('findmyhaji_token');
      const response = await fetch(`${BACKEND_URL}/api/configurations/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target.result);
          setFileContent(event.target.result);
          
          // Extract Firebase config from uploaded JSON
          if (jsonContent.project_info && jsonContent.client) {
            const clientInfo = jsonContent.client[0];
            const apiKeyInfo = clientInfo.api_key[0];
            
            setConfig(prev => ({
              ...prev,
              projectId: jsonContent.project_info.project_id || '',
              storageBucket: jsonContent.project_info.storage_bucket || '',
              apiKey: apiKeyInfo.current_key || '',
              authDomain: `${jsonContent.project_info.project_id}.firebaseapp.com`,
              messagingSenderId: jsonContent.project_info.project_number || '',
              appId: clientInfo.client_info.mobilesdk_app_id || '',
              measurementId: clientInfo.services?.analytics_service?.analytics_property?.tracking_id || ''
            }));
          }
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid Firebase configuration file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file.');
    }
  };

  const handleContentPaste = () => {
    try {
      const jsonContent = JSON.parse(fileContent);
      
      // Extract Firebase config from pasted JSON
      if (jsonContent.project_info && jsonContent.client) {
        const clientInfo = jsonContent.client[0];
        const apiKeyInfo = clientInfo.api_key[0];
        
        setConfig(prev => ({
          ...prev,
          projectId: jsonContent.project_info.project_id || '',
          storageBucket: jsonContent.project_info.storage_bucket || '',
          apiKey: apiKeyInfo.current_key || '',
          authDomain: `${jsonContent.project_info.project_id}.firebaseapp.com`,
          messagingSenderId: jsonContent.project_info.project_number || '',
          appId: clientInfo.client_info.mobilesdk_app_id || '',
          measurementId: clientInfo.services?.analytics_service?.analytics_property?.tracking_id || ''
        }));
      }
    } catch (error) {
      alert('Invalid JSON content. Please paste valid Firebase configuration JSON.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'file-upload', name: 'File Upload', icon: Upload },
    { id: 'file-content', name: 'File Content', icon: FileText }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Firebase Notifications</h3>
            <p className="text-sm text-gray-600">Activate Firebase Cloud Messaging</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleInputChange('enabled', !config.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.enabled ? 'bg-green-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            config.enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Configuration Tabs */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'file-upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Firebase Configuration JSON
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Drop your google-services.json file here, or
                    </p>
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">How to get Firebase configuration:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to Firebase Console → Project Settings</li>
                      <li>Scroll down to "Your apps" section</li>
                      <li>Click on your Android/iOS app</li>
                      <li>Download google-services.json file</li>
                      <li>Upload the file here</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'file-content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Firebase Configuration JSON
                </label>
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your Firebase configuration JSON content here..."
                />
              </div>
              
              <button
                type="button"
                onClick={handleContentPaste}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Parse JSON Content
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Firebase Configuration</h4>
          <button
            type="button"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type={showSensitiveData ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter Project ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auth Domain</label>
            <input
              type="text"
              value={config.authDomain}
              onChange={(e) => handleInputChange('authDomain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="project-id.firebaseapp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
            <input
              type="text"
              value={config.storageBucket}
              onChange={(e) => handleInputChange('storageBucket', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="project-id.appspot.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Sender ID</label>
            <input
              type="text"
              value={config.messagingSenderId}
              onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter Messaging Sender ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => handleInputChange('appId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter App ID"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID (Optional)</label>
            <input
              type="text"
              value={config.measurementId}
              onChange={(e) => handleInputChange('measurementId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Saving...' : 'Update Configuration'}
        </button>
      </div>
    </form>
  );
};

export default FirebaseNotificationConfig;