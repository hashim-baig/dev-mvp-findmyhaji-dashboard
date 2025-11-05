import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

const HeaderSection = (props) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState(location.pathname);

  const handleOnclick = (link) => {
    setActive(link);
    props.onClick(link);
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/about-us", label: "About" },
    { href: "/mission", label: "Mission" },
    { href: "/features", label: "Features" },
    { href: "/blogs", label: "Blogs" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact-us", label: "Contact" },
  ];
  
  return (
    <>
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-16 py-4 shadow-sm bg-white fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/images/LOGO.png"
            alt="FindMyHaji"
            className="h-10 w-auto"
          />
          <span className="text-lg font-semibold text-green-800">FindMyHaji</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
          {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleOnclick(link.href)}
                className={`transition ${
                  active === link.href
                    ? "text-green-700 border-b-2 border-green-700 pb-1"
                    : "hover:text-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:block">
          <button className="bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition">
            Download App
          </button>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-40">
          <nav className="flex flex-col items-start px-6 py-4 space-y-3 text-gray-700 font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => {
                  setActive(link.href);
                  setIsMenuOpen(false);
                }}
                className={`text-left w-full transition ${
                  active === link.href
                    ? "text-green-700 font-semibold"
                    : "hover:text-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button className="mt-3 bg-green-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-800 transition w-full">
              Download App
            </button>
          </nav>
        </div>
      )}
      </>
  );
};

export default HeaderSection;