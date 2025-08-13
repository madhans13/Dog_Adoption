import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from "./ui/button";
import DogAdoptionNavigation from './DogAdoptionNavigation';
import { Heart, ArrowRight, Users, Shield } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export default function LandingPage({ onGetStarted, onLearnMore }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f4f6ff]">
             {/* Logo */}
       <div className="absolute top-6 left-6 z-50">
         <div className="flex items-center space-x-3">
           <div>
             <h1 className="text-1xl font-bold text-gray-900" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
               Happy Strays
             </h1>
           </div>
         </div>
       </div>

       {/* Navigation */}
       <DogAdoptionNavigation onAdoptionClick={onGetStarted} />

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center w-full"
        style={{ y: heroY }}
      >
        <div className="w-full grid lg:grid-cols-3 gap-8 items-center px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          {/* Left Content */}
          <motion.div
            className="space-y-8 lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Success Indicator */}
            <div className="flex items-center space-x-3">
  <div className="flex -space-x-2">
    <img
      className="w-8 h-8 rounded-full border-2 border-white object-cover"
      src="https://randomuser.me/api/portraits/men/1.jpg"
      alt="User profile 1"
    />
    <img
      className="w-8 h-8 rounded-full border-2 border-white object-cover"
      src="https://randomuser.me/api/portraits/women/2.jpg"
      alt="User profile 2"
    />
    <img
      className="w-8 h-8 rounded-full border-2 border-white object-cover"
      src="https://randomuser.me/api/portraits/men/3.jpg"
      alt="User profile 3"
    />
    <img
      className="w-8 h-8 rounded-full border-2 border-white object-cover"
      src="https://randomuser.me/api/portraits/women/4.jpg"
      alt="User profile 4"
    />
  </div>
  <span className="text-gray-600 text-sm font-medium">
    Join over 2,800+ happy adopters
  </span>
</div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Find Your
                <br />
                <span className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Perfect Companion
                </span>
              </h1>

              <p className="text-0xl text-gray-400 leading-relaxed max-w-lg">
                Discover the joy of adopting a loving dog from trusted shelters. Our caring process helps you find a loyal companion who’ll fill your life with love.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={onGetStarted}
                className="bg-[#1B56FD] text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Find Your Companion
              </Button>

              {/* <Button
                onClick={onLearnMore}
                variant="ghost"
                className="bg-[#E9DFC3] text-gray-700 hover:text-black px-4 py-4 text-lg font-medium"
              >
                About Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button> */}
            </div>

            {/* Trust Indicator */}
            <p className="text-sm text-gray-500 font-medium">
              Partnered with 150+ trusted shelters
            </p>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative lg:col-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              className="w-full h-[500px] bg-cover bg-center rounded-3xl relative"
              style={{
                backgroundImage: 'url(/landingpage.png)',
              }}
            ></div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">2,847</div>
              <div className="text-gray-600">Happy Adoptions</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-gray-600">Partner Shelters</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">89%</div>
              <div className="text-gray-600">Success Rate</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose our platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make dog adoption simple, safe, and successful for everyone involved
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Shelters',
                description: 'All partner shelters are thoroughly vetted and certified for safety and care standards.'
              },
              {
                icon: Heart,
                title: 'Smart Matching',
                description: 'Our algorithm matches you with dogs based on lifestyle, preferences, and compatibility.'
              },
              {
                icon: Users,
                title: 'Ongoing Support',
                description: 'Get lifetime access to our community of experts and fellow pet parents for guidance.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to meet your new best friend?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Start your adoption journey today and experience the unconditional love that only a dog can provide.
            </p>
            <Button
              onClick={onGetStarted}
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg transform hover:scale-105 transition-all duration-300"
            >
              Begin Your Journey
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}