import React, { useState, useEffect } from 'react';
import { 
  Save,
  Eye,
  Edit,
  Globe,
  Image,
  Type,
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WebsiteContentManager = () => {
  const [content, setContent] = useState({});
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [message, setMessage] = useState({ type: '', text: '' });

  const sections = [
    { key: 'hero', name: 'Hero Section', icon: Monitor },
    { key: 'about', name: 'About Us', icon: Type },
    { key: 'mission', name: 'Mission & Vision', icon: Globe },
    { key: 'pricing', name: 'Pricing Plans', icon: Layout }
  ];

  // Load website content
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/website/admin/content`);
      const data = await response.json();
      
      if (data.success) {
        // Convert array to object with section as key
        const contentMap = {};
        data.data.forEach(item => {
          contentMap[item.section] = item;
        });
        setContent(contentMap);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage({ type: 'error', text: 'Failed to load website content' });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (section, updates) => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/website/admin/content/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (data.success) {
        setContent(prev => ({
          ...prev,
          [section]: data.data
        }));
        setMessage({ type: 'success', text: 'Content updated successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update content' });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const openLandingPage = () => {
    window.open('/landing', '_blank');
  };

  const renderHeroEditor = () => {
    const heroContent = content.hero || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={heroContent.title || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: { ...prev.hero, title: e.target.value }
              }))}
              placeholder="Your Pilgrimage. Connected."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arabic Greeting</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={heroContent.content?.greeting || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: {
                  ...prev.hero,
                  content: { ...prev.hero?.content, greeting: e.target.value }
                }
              }))}
              placeholder="Assalāmu 'Alaikum wa Rahmatullāhi wa Barakātuh"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
            value={heroContent.subtitle || ''}
            onChange={(e) => setContent(prev => ({
              ...prev,
              hero: { ...prev.hero, subtitle: e.target.value }
            }))}
            placeholder="Experience peace of mind during your sacred journey..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={heroContent.content?.primaryButton || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: {
                  ...prev.hero,
                  content: { ...prev.hero?.content, primaryButton: e.target.value }
                }
              }))}
              placeholder="Download App"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={heroContent.content?.secondaryButton || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: {
                  ...prev.hero,
                  content: { ...prev.hero?.content, secondaryButton: e.target.value }
                }
              }))}
              placeholder="Learn More"
            />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Hero Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1565828480412-f95f33fe9e70?w=400" 
                alt="Zam-zam Tower with pilgrims"
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-1">Zam-zam Tower (Hero Background)</p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1575101261474-5cb5653bb416?w=400" 
                alt="Nabawi Mosque"
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-1">Nabawi Mosque (Section Background)</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAboutEditor = () => {
    const aboutContent = content.about || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={aboutContent.title || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                about: { ...prev.about, title: e.target.value }
              }))}
              placeholder="What is FindMyHaji?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={aboutContent.subtitle || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                about: { ...prev.about, subtitle: e.target.value }
              }))}
              placeholder="Connecting hearts and souls across distances..."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={4}
            value={aboutContent.content?.description || ''}
            onChange={(e) => setContent(prev => ({
              ...prev,
              about: {
                ...prev.about,
                content: { ...prev.about?.content, description: e.target.value }
              }
            }))}
            placeholder="FindMyHaji was born from a simple yet profound need..."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Feature Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1572314997669-275cf96124fc?w=200" 
                alt="Navigation compass"
                className="w-full h-20 object-cover rounded-lg"
              />
              <p className="text-xs text-gray-600 mt-1">GPS Tracking</p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1512757776214-26d36777b513?w=200" 
                alt="Directional signpost"
                className="w-full h-20 object-cover rounded-lg"
              />
              <p className="text-xs text-gray-600 mt-1">Emergency SOS</p>
            </div>
            <div>
              <img 
                src="https://images.pexels.com/photos/32822914/pexels-photo-32822914.jpeg?w=200" 
                alt="Pilgrims at Kaaba"
                className="w-full h-20 object-cover rounded-lg"
              />
              <p className="text-xs text-gray-600 mt-1">Group Management</p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1720173438123-bf33c520ba7e?w=200" 
                alt="Islamic architecture"
                className="w-full h-20 object-cover rounded-lg"
              />
              <p className="text-xs text-gray-600 mt-1">Family Updates</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMissionEditor = () => {
    const missionContent = content.mission || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={missionContent.title || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                mission: { ...prev.mission, title: e.target.value }
              }))}
              placeholder="Our Mission & Vision"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={missionContent.subtitle || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                mission: { ...prev.mission, subtitle: e.target.value }
              }))}
              placeholder="Guided by faith, empowered by technology"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
            value={missionContent.content?.mission || ''}
            onChange={(e) => setContent(prev => ({
              ...prev,
              mission: {
                ...prev.mission,
                content: { ...prev.mission?.content, mission: e.target.value }
              }
            }))}
            placeholder="To provide peace of mind to pilgrims and their families..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vision Statement</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
            value={missionContent.content?.vision || ''}
            onChange={(e) => setContent(prev => ({
              ...prev,
              mission: {
                ...prev.mission,
                content: { ...prev.mission?.content, vision: e.target.value }
              }
            }))}
            placeholder="To be the most trusted companion for Muslim pilgrims worldwide..."
          />
        </div>
      </div>
    );
  };

  const renderPricingEditor = () => {
    const pricingContent = content.pricing || {};
    const plans = pricingContent.content?.plans || [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={pricingContent.title || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                pricing: { ...prev.pricing, title: e.target.value }
              }))}
              placeholder="Subscription Plans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={pricingContent.subtitle || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                pricing: { ...prev.pricing, subtitle: e.target.value }
              }))}
              placeholder="Affordable access for every pilgrim"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Pricing Plans</h4>
          {plans.map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={plan.name || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, name: e.target.value };
                      setContent(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          content: { ...prev.pricing?.content, plans: updatedPlans }
                        }
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={plan.price || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, price: e.target.value };
                      setContent(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          content: { ...prev.pricing?.content, plans: updatedPlans }
                        }
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={plan.period || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, period: e.target.value };
                      setContent(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          content: { ...prev.pricing?.content, plans: updatedPlans }
                        }
                      }));
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  value={(plan.features || []).join('\n')}
                  onChange={(e) => {
                    const updatedPlans = [...plans];
                    updatedPlans[index] = { 
                      ...plan, 
                      features: e.target.value.split('\n').filter(f => f.trim()) 
                    };
                    setContent(prev => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        content: { ...prev.pricing?.content, plans: updatedPlans }
                      }
                    }));
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'hero':
        return renderHeroEditor();
      case 'about':
        return renderAboutEditor();
      case 'mission':
        return renderMissionEditor();
      case 'pricing':
        return renderPricingEditor();
      default:
        return <div>Section not found</div>;
    }
  };

  const handleSave = () => {
    const sectionContent = content[activeSection];
    if (sectionContent) {
      updateContent(activeSection, sectionContent);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Content Management</h1>
              <p className="text-gray-600">Manage FindMyHaji landing page content dynamically</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openLandingPage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview Landing Page
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Sections</h3>
              <nav className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.key
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Preview Mode</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'desktop', label: 'Desktop', icon: Monitor },
                    { key: 'tablet', label: 'Tablet', icon: Tablet },
                    { key: 'mobile', label: 'Mobile', icon: Smartphone }
                  ].map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => setPreviewMode(mode.key)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          previewMode === mode.key
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Edit className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit {sections.find(s => s.key === activeSection)?.name}
                  </h2>
                </div>
              </div>
              
              <div className="p-6">
                {renderSectionContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteContentManager;