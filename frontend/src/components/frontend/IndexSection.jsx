import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { NetworkFront } from "@/lib/Network";
import { Urls } from "@/lib/utils";
import HeaderSection from "./header/HeaderSection";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import MissionSection from "./MissionSection";
import PricingSection from "./PricingSection";

const IndexSection = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/':
        fetchContent('hero');
        break;
      case '/about-us':
        fetchContent('about');
        break;
      case '/mission':
        fetchContent('mission');
        break;
      case '/pricing':
        fetchContent('pricing');
        break;
      // case '/features':
      //   setActiveSection("features");
      //   break;
      // case '/blogs':
      //   setActiveSection("blogs");
      //   break;
      // case '/contact-us':
      //   setActiveSection("contact_us");
      //   break;
      default:
        fetchContent('hero');
        break;
    }
  }, []);

  const handleOnclick = (link) => {
    switch (link) {
      case '/':
        fetchContent('hero');
        break;
      case '/about-us':
        fetchContent('about');
        break;
      case '/mission':
        fetchContent('mission');
        break;
      case '/pricing':
        fetchContent('pricing');
        break;
      // case '/features':
      //   fetchContent('features');
      //   break;
      // case '/blogs':
      //   fetchContent('blogs');
      //   break;
      // case '/contact-us':
      //   fetchContent('contact_us');
      //   break;
      default:
        fetchContent('hero');
        break;
    }
  };
  // Helper to render dynamically
  const renderSection = () => {
    switch (activeSection) {
      case "hero":
        return <HeroSection content={content} />;
      case "about":
        return <AboutSection content={content} />;
      case "mission":
        return <MissionSection content={content} />;
      case "pricing":
        console.log("Rendering Pricing Section with content:", content);
        return <PricingSection content={content} />;
      default:
        return <HeroSection content={content} />;
    }
  };

  const fetchContent = async (section) => {
    try {
        const headers =  {
          'Content-Type': 'application/json'
        };  
      const response = await NetworkFront.get(Urls.baseUrl +'/website/content/'+section, headers);
      if (response.data.success === 'success') {
        setContent(response.data.data);
        setActiveSection(section);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fffefb] to-[#faf8f4] font-sans">
      <HeaderSection onClick={handleOnclick} />

       {/* Render dynamically */}
      {renderSection()}
    </div>
  );
};

export default IndexSection;
