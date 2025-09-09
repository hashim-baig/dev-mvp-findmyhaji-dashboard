import React, { useState, useEffect } from 'react';
import { Database, Save, RefreshCw, Eye, EyeOff, Cloud, HardDrive, Upload } from 'lucide-react';

const StorageConfig = ({ onSave, loading, category }) => {
  const [configs, setConfigs] = useState({});
  const [showSensitiveData, setShowSensitiveData] = useState({});

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const storageProviders = [
    {
      id: 'aws_s3',
      name: 'Amazon S3',
      description: 'Amazon Simple Storage Service - scalable cloud storage',
      icon: Cloud,
      color: 'orange',
      fields: [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { key: 'region', label: 'Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'], required: true },
        { key: 'bucketName', label: 'Bucket Name', type: 'text', required: true },
        { key: 'endpoint', label: 'Custom Endpoint (Optional)', type: 'url', required: false }
      ]
    },
    {
      id: 'google_cloud',
      name: 'Google Cloud Storage',
      description: 'Google Cloud Platform storage service',
      icon: Cloud,
      color: 'blue',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'keyFilename', label: 'Service Account Key File', type: 'file', accept: '.json', required: true },
        { key: 'bucketName', label: 'Bucket Name', type: 'text', required: true }
      ]
    },
    {
      id: 'azure_blob',
      name: 'Azure Blob Storage',
      description: 'Microsoft Azure cloud storage service',
      icon: Cloud,
      color: 'blue',
      fields: [
        { key: 'accountName', label: 'Storage Account Name', type: 'text', required: true },
        { key: 'accountKey', label: 'Account Key', type: 'password', required: true },
        { key: 'containerName', label: 'Container Name', type: 'text', required: true },
        { key: 'endpoint', label: 'Custom Endpoint (Optional)', type: 'url', required: false }
      ]
    },
    {
      id: 'digitalocean_spaces',
      name: 'DigitalOcean Spaces',
      description: 'DigitalOcean object storage service',
      icon: Cloud,
      color: 'indigo',
      fields: [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { key: 'region', label: 'Region', type: 'select', options: ['nyc1', 'nyc3', 'ams3', 'sgp1', 'fra1'], required: true },
        { key: 'spaceName', label: 'Space Name', type: 'text', required: true },
        { key: 'endpoint', label: 'Endpoint', type: 'text', required: true, placeholder: 'nyc3.digitaloceanspaces.com' }
      ]
    },
    {
      id: 'local_storage',
      name: 'Local Storage',
      description: 'Store files on the local server filesystem',
      icon: HardDrive,
      color: 'gray',
      fields: [
        { key: 'storagePath', label: 'Storage Path', type: 'text', required: true, placeholder: '/app/uploads' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', required: true, placeholder: 'https://yourdomain.com/uploads' },
        { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', required: true, default: '10' },
        { key: 'allowedExtensions', label: 'Allowed Extensions', type: 'text', required: false, placeholder: '.jpg,.png,.pdf,.doc' }
      ]
    }
  ];

  const colorClasses = {
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' }
  };

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
          setConfigs(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(configs);
  };

  const handleProviderToggle = (providerId) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        enabled: !prev[providerId]?.enabled
      }
    }));
  };

  const handleFieldChange = (providerId, fieldKey, value) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldKey]: value
      }
    }));
  };

  const handleFileUpload = (providerId, fieldKey, e) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldKey === 'keyFilename' && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonContent = JSON.parse(event.target.result);
            setConfigs(prev => ({
              ...prev,
              [providerId]: {
                ...prev[providerId],
                [fieldKey]: event.target.result,
                keyFileContent: jsonContent
              }
            }));
          } catch (error) {
            alert('Invalid JSON file. Please upload a valid service account key file.');
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a valid JSON file.');
      }
    }
  };

  const toggleSensitiveData = (providerId, fieldKey) => {
    const key = `${providerId}_${fieldKey}`;
    setShowSensitiveData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProviderConfig = (providerId) => {
    return configs[providerId] || { enabled: false };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Storage Configuration</h4>
            <p className="text-sm text-blue-700">
              Configure external storage services for file uploads, backups, and media storage. You can enable multiple providers for redundancy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {storageProviders.map((provider) => {
          const config = getProviderConfig(provider.id);
          const colors = colorClasses[provider.color];
          const IconComponent = provider.icon;

          return (
            <div
              key={provider.id}
              className={`border-2 rounded-xl transition-all ${
                config.enabled
                  ? `${colors.border} ${colors.bg}`
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Provider Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <IconComponent className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleProviderToggle(provider.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Provider Configuration */}
              {config.enabled && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.fields.map((field) => {
                      const fieldValue = config[field.key] || field.default || '';
                      const isPassword = field.type === 'password';
                      const showPassword = showSensitiveData[`${provider.id}_${field.key}`];

                      return (
                        <div key={field.key} className={field.key === 'storagePath' || field.key === 'baseUrl' || field.key === 'keyFilename' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required={field.required}
                            >
                              <option value="">Select {field.label}</option>
                              {field.options?.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'file' ? (
                            <div className="space-y-2">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Upload {field.label}</p>
                                <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="file"
                                    accept={field.accept}
                                    onChange={(e) => handleFileUpload(provider.id, field.key, e)}
                                    className="hidden"
                                  />
                                  Choose File
                                </label>
                              </div>
                              {config[field.key] && (
                                <p className="text-xs text-green-600">✓ File uploaded successfully</p>
                              )}
                            </div>
                          ) : field.type === 'number' ? (
                            <input
                              type="number"
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={field.placeholder}
                              min="1"
                              required={field.required}
                            />
                          ) : (
                            <div className="relative">
                              <input
                                type={isPassword && !showPassword ? 'password' : field.type}
                                value={fieldValue}
                                onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                              
                              {isPassword && (
                                <button
                                  type="button"
                                  onClick={() => toggleSensitiveData(provider.id, field.key)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Provider-specific setup instructions */}
                  <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
                    <p className={`text-xs ${colors.text} font-semibold mb-2`}>Setup Instructions:</p>
                    <div className={`text-xs ${colors.text} space-y-1`}>
                      {provider.id === 'aws_s3' && (
                        <>
                          <p>1. Create an S3 bucket in AWS Console</p>
                          <p>2. Create IAM user with S3 permissions</p>
                          <p>3. Generate access key and secret key</p>
                          <p>4. Set proper bucket permissions for public access</p>
                        </>
                      )}
                      {provider.id === 'google_cloud' && (
                        <>
                          <p>1. Create a project in Google Cloud Console</p>
                          <p>2. Enable Cloud Storage API</p>
                          <p>3. Create a service account with Storage permissions</p>
                          <p>4. Download service account key JSON file</p>
                        </>
                      )}
                      {provider.id === 'azure_blob' && (
                        <>
                          <p>1. Create storage account in Azure Portal</p>
                          <p>2. Create a container for file storage</p>
                          <p>3. Get account name and access key</p>
                          <p>4. Configure public access if needed</p>
                        </>
                      )}
                      {provider.id === 'digitalocean_spaces' && (
                        <>
                          <p>1. Create a Space in DigitalOcean Control Panel</p>
                          <p>2. Generate Spaces access keys</p>
                          <p>3. Configure CORS settings if needed</p>
                          <p>4. Set proper file permissions</p>
                        </>
                      )}
                      {provider.id === 'local_storage' && (
                        <>
                          <p>1. Ensure storage directory exists and is writable</p>
                          <p>2. Configure web server to serve files from storage path</p>
                          <p>3. Set appropriate file permissions (755 for directories, 644 for files)</p>
                          <p>4. Consider backup strategy for local files</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Storage Best Practices */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-3">Storage Best Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div>
            <h5 className="font-semibold mb-2">Security</h5>
            <ul className="space-y-1">
              <li>• Use IAM roles with minimal required permissions</li>
              <li>• Enable encryption at rest and in transit</li>
              <li>• Regularly rotate access keys</li>
              <li>• Monitor access logs for suspicious activity</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Performance</h5>
            <ul className="space-y-1">
              <li>• Choose regions close to your users</li>
              <li>• Use CDN for better global distribution</li>
              <li>• Implement proper caching strategies</li>
              <li>• Monitor storage costs and usage</li>
            </ul>
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
          {loading ? 'Saving...' : 'Update Storage Configuration'}
        </button>
      </div>
    </form>
  );
};

export default StorageConfig;