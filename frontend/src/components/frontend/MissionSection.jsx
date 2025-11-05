import React from "react";
import { Target, Star } from 'lucide-react';


const MissionSection = (props) => {

    return (
        <>
            {/* Mission Section */}
            <section
                className="scroll-mt-28 md:scroll-mt-32 py-28 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-green-800 to-emerald-600 text-white text-center"
            >
                {/* Heading */}
                <div className="max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">{props.content.title}</h2>
                    <p className="text-green-100 text-base md:text-lg">
                        {props.content.subtitle}
                    </p>
                </div>

                {/* Mission & Vision Content */}
                <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto text-left">
                    {/* Mission */}
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="text-yellow-400 text-2xl" />
                            <h3 className="text-xl font-semibold text-yellow-300">Our Mission</h3>
                        </div>
                        <p className="text-green-50 leading-relaxed">
                            {props.content.mission}
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Star className="text-yellow-400 text-2xl" />
                            <h3 className="text-xl font-semibold text-yellow-300">Our Vision</h3>
                        </div>
                        <p className="text-green-50 leading-relaxed">
                            {props.content.vision}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default MissionSection;