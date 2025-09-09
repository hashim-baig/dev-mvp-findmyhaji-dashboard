import React, { useState, useEffect } from 'react';
import { Bell, Globe, Users, Smartphone, MessageSquare, ToggleLeft, ToggleRight, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const PushNotificationConfig = () => {
  const [activeLanguage, setActiveLanguage] = useState('default');
  const [activeMessageType, setActiveMessageType] = useState('pilgrims');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({});
  const [savedMessage, setSavedMessage] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const languages = [
    { code: 'default', name: 'Default', flag: '🌍' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic - العربية', flag: '🇸🇦', rtl: true },
    { code: 'ur', name: 'Urdu - اُردُو', flag: '🇵🇰', rtl: true },
    { code: 'bn', name: 'Bengali - বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'Hindi - हिंदी', flag: '🇮🇳' }
  ];

  const messageTypes = [
    { 
      code: 'pilgrims', 
      name: 'Messages for Pilgrims', 
      icon: Users, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      description: 'Notifications sent directly to pilgrims during their journey'
    },
    { 
      code: 'providers', 
      name: 'Messages for Providers', 
      icon: MessageSquare, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      description: 'Notifications for service providers and tour operators'
    },
    { 
      code: 'family', 
      name: 'Messages for Family Members', 
      icon: Bell, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      description: 'Updates sent to family members tracking pilgrims'
    }
  ];

  const messageTemplates = {
    pilgrims: [
      {
        key: 'booking_placed',
        name: 'Booking Placed',
        description: 'Sent when a pilgrim places a new booking',
        defaultText: 'Your booking has been successfully placed. Reference: {booking_id}',
        variables: ['{booking_id}', '{service_name}', '{date}']
      },
      {
        key: 'booking_accepted',
        name: 'Booking Accepted',
        description: 'Sent when provider accepts the booking',
        defaultText: 'Great news! Your booking for {service_name} has been accepted.',
        variables: ['{booking_id}', '{service_name}', '{provider_name}', '{date}']
      },
      {
        key: 'booking_ongoing',
        name: 'Booking Ongoing',
        description: 'Sent when the service is currently active',
        defaultText: 'Your service {service_name} is now active. Safe travels!',
        variables: ['{service_name}', '{location}', '{duration}']
      },
      {
        key: 'booking_complete',
        name: 'Booking Complete',
        description: 'Sent when service is completed',
        defaultText: 'Your service has been completed successfully. Barakallahu feeki!',
        variables: ['{service_name}', '{rating_link}']
      },
      {
        key: 'booking_cancelled',
        name: 'Booking Cancelled',
        description: 'Sent when booking is cancelled',
        defaultText: 'Your booking for {service_name} has been cancelled. Refund will be processed.',
        variables: ['{booking_id}', '{service_name}', '{reason}']
      },
      {
        key: 'schedule_change',
        name: 'Schedule Time Change',
        description: 'Sent when timing is updated',
        defaultText: 'Schedule update: Your {service_name} time has changed to {new_time}.',
        variables: ['{service_name}', '{new_time}', '{old_time}']
      },
      {
        key: 'group_leader_assigned',
        name: 'Assign Group Leader',
        description: 'Sent when assigned to a group',
        defaultText: 'You have been assigned to group {group_name}. Leader: {leader_name}',
        variables: ['{group_name}', '{leader_name}', '{contact}']
      },
      {
        key: 'otp_verification',
        name: 'OTP Verification Message',
        description: 'OTP for verification purposes',
        defaultText: 'Your FindMyHaji verification code is: {otp}. Valid for 5 minutes.',
        variables: ['{otp}', '{expiry_time}']
      },
      {
        key: 'daily_tip',
        name: 'Hajj Tip / Daily Reminder',
        description: 'Daily spiritual guidance and tips',
        defaultText: 'Daily Reminder: {tip_content} - May Allah accept your pilgrimage.',
        variables: ['{tip_content}', '{prayer_time}']
      },
      {
        key: 'add_funds',
        name: 'Add Funds Notification',
        description: 'Wallet balance updates',
        defaultText: 'Funds added successfully! New balance: {balance} SAR',
        variables: ['{amount}', '{balance}', '{transaction_id}']
      },
      {
        key: 'payment_approved',
        name: 'Offline Payment Approved',
        description: 'Manual payment confirmation',
        defaultText: 'Your offline payment of {amount} SAR has been approved.',
        variables: ['{amount}', '{payment_method}', '{reference}']
      },
      {
        key: 'custom_support',
        name: 'Request Custom Support',
        description: 'Custom support responses',
        defaultText: 'Support team will contact you within 30 minutes regarding: {issue}',
        variables: ['{issue}', '{priority}', '{eta}']
      },
      {
        key: 'location_updated',
        name: 'Location Updated Alert',
        description: 'Location sharing notifications',
        defaultText: 'Your location has been shared with family. Current: {location}',
        variables: ['{location}', '{time}', '{accuracy}']
      },
      {
        key: 'lost_pilgrim',
        name: 'Lost Pilgrim Alert',
        description: 'Emergency location alerts',
        defaultText: 'URGENT: Please confirm your safety. Emergency contacts notified.',
        variables: ['{last_location}', '{emergency_contact}', '{help_number}']
      }
    ],
    providers: [
      {
        key: 'new_booking',
        name: 'New Booking Request',
        description: 'New booking received from pilgrim',
        defaultText: 'New booking request for {service_name} from {pilgrim_name}.',
        variables: ['{pilgrim_name}', '{service_name}', '{date}', '{amount}']
      },
      {
        key: 'booking_confirmed',
        name: 'Booking Confirmed',
        description: 'Booking confirmation by provider',
        defaultText: 'Booking confirmed for {pilgrim_name}. Service starts at {time}.',
        variables: ['{pilgrim_name}', '{time}', '{location}']
      },
      {
        key: 'payment_received',
        name: 'Payment Received',
        description: 'Payment notification for providers',
        defaultText: 'Payment of {amount} SAR received for booking {booking_id}.',
        variables: ['{amount}', '{booking_id}', '{commission}']
      },
      {
        key: 'rating_received',
        name: 'Rating & Review',
        description: 'New rating from pilgrim',
        defaultText: 'New {stars}-star rating from {pilgrim_name}: "{review}"',
        variables: ['{stars}', '{pilgrim_name}', '{review}']
      },
      {
        key: 'profile_update',
        name: 'Profile Update Required',
        description: 'Profile verification reminders',
        defaultText: 'Please update your profile documents for continued service.',
        variables: ['{missing_docs}', '{deadline}']
      }
    ],
    family: [
      {
        key: 'pilgrim_arrived',
        name: 'Pilgrim Arrived Safely',
        description: 'Safe arrival notification',
        defaultText: '{pilgrim_name} has arrived safely in {location}. Alhamdulillah!',
        variables: ['{pilgrim_name}', '{location}', '{time}']
      },
      {
        key: 'location_update',
        name: 'Location Update',
        description: 'Real-time location sharing',
        defaultText: '{pilgrim_name} is currently at {location}. Last updated: {time}',
        variables: ['{pilgrim_name}', '{location}', '{time}', '{activity}']
      },
      {
        key: 'emergency_alert',
        name: 'Emergency Alert',
        description: 'Emergency situation notification',
        defaultText: 'URGENT: {pilgrim_name} needs assistance at {location}. Contact: {number}',
        variables: ['{pilgrim_name}', '{location}', '{number}', '{situation}']
      },
      {
        key: 'ritual_completed',
        name: 'Ritual Completed',
        description: 'Hajj/Umrah milestone notifications',
        defaultText: '{pilgrim_name} has completed {ritual_name}. May Allah accept it!',
        variables: ['{pilgrim_name}', '{ritual_name}', '{location}', '{time}']
      },
      {
        key: 'journey_complete',
        name: 'Journey Complete',
        description: 'Hajj/Umrah completion notification',
        defaultText: 'Alhamdulillah! {pilgrim_name} has completed their pilgrimage successfully.',
        variables: ['{pilgrim_name}', '{completion_date}', '{return_flight}']
      }
    ]
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findmyhaji_token');
      const response = await fetch(`${BACKEND_URL}/api/notifications/admin/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotification = async (messageType, messageKey, updates) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('findmyhaji_token');
      
      const payload = {
        messageType,
        messageKey,
        language: activeLanguage,
        ...updates
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/admin/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchNotifications();
        setSavedMessage('Configuration saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    } finally {
      setSaving(false);
    }
  };

  const getNotificationConfig = (messageType, messageKey, language = 'default') => {
    return notifications[messageType]?.[messageKey]?.[language] || {
      text: '',
      enabled: true
    };
  };

  const renderMessageTemplate = (template) => {
    const config = getNotificationConfig(activeMessageType, template.key, activeLanguage);
    const currentLanguage = languages.find(lang => lang.code === activeLanguage);
    
    return (
      <div key={template.key} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <button
                  onClick={() => {
                    const newEnabled = !config.enabled;
                    updateNotification(activeMessageType, template.key, { enabled: newEnabled });
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    config.enabled 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {config.enabled ? (
                    <ToggleRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              {template.variables && template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map(variable => (
                      <span 
                        key={variable}
                        className="inline-flex items-center px-2 py-1 text-xs font-mono bg-blue-50 text-blue-700 rounded border border-blue-100"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Text ({currentLanguage?.name})
              </label>
              <textarea
                value={config.text || template.defaultText}
                onChange={(e) => {
                  const newNotifications = { ...notifications };
                  if (!newNotifications[activeMessageType]) newNotifications[activeMessageType] = {};
                  if (!newNotifications[activeMessageType][template.key]) newNotifications[activeMessageType][template.key] = {};
                  if (!newNotifications[activeMessageType][template.key][activeLanguage]) {
                    newNotifications[activeMessageType][template.key][activeLanguage] = {};
                  }
                  newNotifications[activeMessageType][template.key][activeLanguage].text = e.target.value;
                  setNotifications(newNotifications);
                }}
                rows={3}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all ${
                  currentLanguage?.rtl ? 'text-right' : 'text-left'
                }`}
                placeholder={template.defaultText}
                dir={currentLanguage?.rtl ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => updateNotification(activeMessageType, template.key, { 
                  text: config.text || template.defaultText,
                  enabled: config.enabled
                })}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notification configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Push Notification Setup</h1>
              <p className="text-gray-600">Configure Firebase push notifications for different user types and languages</p>
            </div>
          </div>

          {savedMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{savedMessage}</span>
            </div>
          )}
        </div>

        {/* Language Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Language Settings
            </h3>
            <p className="text-sm text-gray-600">Select a language to configure notifications</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setActiveLanguage(language.code)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeLanguage === language.code
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Type Selection */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Message Types
            </h3>
            <p className="text-sm text-gray-600">Choose the user group to configure notifications for</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {messageTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.code}
                    onClick={() => setActiveMessageType(type.code)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      activeMessageType === type.code
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${type.bgColor} w-fit mb-3`}>
                      <IconComponent className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Message Templates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {messageTypes.find(type => type.code === activeMessageType)?.name} Templates
            </h3>
            <span className="text-sm text-gray-500">
              Language: {languages.find(lang => lang.code === activeLanguage)?.name}
            </span>
          </div>

          {messageTemplates[activeMessageType]?.map(renderMessageTemplate)}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationConfig;