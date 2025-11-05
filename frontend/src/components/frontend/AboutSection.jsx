import React from "react";

const AboutSection = (props) => {

    return (
        <>
            {/* About Section */}
            <section className="scroll-mt-28 md:scroll-mt-32 py-28 bg-gradient-to-b from-white to-green-50 px-6 md:px-12 lg:px-20">
                {/* Container */}
                <div className="max-w-6xl mx-auto">
                    {/* Heading */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            {props.content.title.split(' ').slice(0, 2).join(' ')}
                            <span className="text-green-700"> {props.content.title.split(' ').slice(2).join(' ')} </span>
                        </h2>
                        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                            {props.content.subtitle}
                        </p>
                    </div>

                    {/* Grid Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        {/* Left Column */}
                        <div>
                            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                                Bridging Distance with{" "}
                                <span className="text-green-700">Technology</span>
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {props.content.greeting}
                            </p>
                            <button className="border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-medium py-3 px-6 rounded-full transition duration-300">
                                Explore Features
                            </button>
                        </div>

                        {/* Right Column – Feature Cards */}
                        <div className="space-y-4">
                            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl py-6 px-6 text-center font-medium text-gray-800 hover:shadow-md transition">
                                Real-time GPS Tracking
                            </div>
                            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl py-6 px-6 text-center font-medium text-gray-800 hover:shadow-md transition">
                                Emergency SOS
                            </div>
                            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl py-6 px-6 text-center font-medium text-gray-800 hover:shadow-md transition">
                                Group Management
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutSection;