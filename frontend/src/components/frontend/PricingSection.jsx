import React from "react";

const PricingSection = (props) => {
    
    return (
        <>
            {/* Pricing Section */}
            <section className="bg-white py-20 px-6 md:px-12 lg:px-24 text-center">
                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
                    {props.content?.title || 'Choose Your Plan'}
                </h2>
                <p className="text-gray-600 mb-12">
                    {props.content?.subtitle || 'Affordable access for every pilgrim'}
                </p>

                {/* Plans Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    {props.content.content.plans
                    && props.content.content.plans.length >= 2
                    &&
                    props.content.content.plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`${
                                index === 0
                                    ? 'bg-neutral-50 p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between'
                                    : 'bg-gradient-to-br from-green-800 to-emerald-600 text-white p-10 rounded-3xl shadow-md flex flex-col justify-between'
                            }`}
                        >
                            
                            
                            <div>
                                <h3
                                    className={`text-xl font-semibold mb-4 ${
                                        index === 0 ? 'text-gray-900' : 'text-white'
                                    }`}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className={`text-5xl font-bold mb-2 ${
                                        index === 0 ? 'text-green-800' : 'text-yellow-300'
                                    }`}
                                >
                                    ₹{plan.price}
                                </p>
                                <p
                                    className={`mb-8 ${
                                        index === 0 ? 'text-gray-500' : 'text-gray-100'
                                    }`}
                                >
                                    {plan.billing_cycle}
                                </p>
                                <ul
                                    className={`space-y-3 text-left ${
                                        index === 0 ? 'text-gray-700' : 'text-gray-100'
                                    }`}
                                >
                                    {plan.features.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span
                                                className={
                                                    index === 0
                                                        ? 'text-green-600'
                                                        : 'text-yellow-300'
                                                }
                                            >
                                                ✔
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className={`mt-10 font-medium py-3 rounded-full transition ${
                                    index === 0
                                        ? 'border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white'
                                        : 'bg-yellow-400 text-green-900 hover:bg-yellow-300'
                                }`}
                            >
                                {index === 0 ? 'Get Started' : 'Start Group Journey'}
                            </button>
                        </div>
                    ))
                    }
                    {/* <div className="bg-neutral-50 p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Individual Pilgrim
                            </h3>
                            <p className="text-5xl font-bold text-green-800 mb-2">₹0</p>
                            <p className="text-gray-500 mb-8">Free for life</p>
                            <ul className="text-gray-700 space-y-3 text-left">
                                {[
                                    "GPS location tracking",
                                    "Emergency SOS alerts",
                                    "Basic ritual checklist",
                                    "Prayer times & Qibla",
                                    "Family updates",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="text-green-600">✔</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="mt-10 border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition font-medium py-3 rounded-full">
                            Get Started
                        </button>
                    </div>

                    
                    <div className="bg-gradient-to-br from-green-800 to-emerald-600 text-white p-10 rounded-3xl shadow-md flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Group Access</h3>
                            <p className="text-5xl font-bold text-yellow-300 mb-2">₹199</p>
                            <p className="text-gray-100 mb-8">Per trip (one-time)</p>
                            <ul className="space-y-3 text-left text-gray-100">
                                {[
                                    "All Individual features",
                                    "Group management tools",
                                    "Real-time group tracking",
                                    "Instant group communication",
                                    "Advanced emergency coordination",
                                    "Priority support",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="text-yellow-300">✔</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="mt-10 bg-yellow-400 text-green-900 font-medium py-3 rounded-full hover:bg-yellow-300 transition">
                            Start Group Journey
                        </button>
                    </div> */}
                </div>
            </section>
        </>
    );
};

export default PricingSection;