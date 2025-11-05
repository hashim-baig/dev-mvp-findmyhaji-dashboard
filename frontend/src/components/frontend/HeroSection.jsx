import React from "react";

const HeroSection = (props) => {

return (
    <>
    {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-32 md:pt-40">
        {/* Left Content */}
        <div className="max-w-xl text-left space-y-6">
          <p className="text-sm text-green-800 font-semibold tracking-wide">
            {props.content.greeting}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            {
            props.content.title.split(' ').slice(0, 2).join(' ')
            }
            <br />
            {
            props.content.title.split(' ').slice(2).join(' ')
            }
          </h1>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            {props.content.subtitle}
          </p>
            
          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button className="bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition">
              📱 {props.content.p_button_text}
            </button>
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-yellow-500 transition">
              ▶️ {props.content.s_button_text}
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative mt-12 md:mt-0 flex justify-center md:justify-end w-full md:w-1/2">
          <div className="bg-green-900 rounded-2xl h-40 w-64 md:w-80 relative">
            <div className="absolute top-4 left-6 bg-yellow-400 h-6 w-24 rounded-md"></div>
            <span className="absolute top-16 left-10 w-2 h-2 bg-yellow-300 rounded-full"></span>
            <span className="absolute top-12 right-8 w-2 h-2 bg-pink-400 rounded-full"></span>
            <span className="absolute bottom-10 left-10 w-3 h-3 bg-green-400 rounded-full"></span>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;