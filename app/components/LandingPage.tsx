import React, { useRef, useState, useEffect } from 'react';
import { getApiBaseUrl } from "../lib/utils";
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from "./ui/button";
import DogAdoptionNavigation from './DogAdoptionNavigation';
import { Heart, ArrowRight, Users, Shield, MapPin, Clock, CheckCircle, Star, Calendar, MessageCircle, Award, Zap } from 'lucide-react';

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  location: string;
  traits: string[];
  image: string;
  status: string;
}

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
  
  // State for dogs
  const [featuredDogs, setFeaturedDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available dogs
  useEffect(() => {
    const fetchFeaturedDogs = async () => {
      try {
        setLoading(true);
                 const base = getApiBaseUrl();
                 console.log(base);
                 const response = await fetch(`${base}/api/dogs`);
                 
                 
        if (!response.ok) {
          
          throw new Error('Failed to fetch dogs');
        }
        
                 const data = await response.json();
         
         console.log('API Response:', data); // Debug log
         
                  // Transform the API data to match exactly what UserHomepage uses
         let dogsData: any[] = [];
         if (Array.isArray(data)) {
           dogsData = data;
         } else if (data && Array.isArray(data.dogs)) {
           dogsData = data.dogs;
         } else {
           console.error('API did not return array format:', data);
           dogsData = [];
         }
         
         // Take first 3 dogs and transform to match our component structure
         const transformedDogs = dogsData.slice(0, 3).map((dog: any) => ({
           id: dog._id || dog.id,
           name: dog.name || 'Unknown',
           breed: dog.breed || 'Mixed Breed',
           age: dog.age ? `${dog.age} years` : 'Unknown age',
           location: dog.location || 'Unknown location',
           traits: dog.traits || dog.personality || ['Friendly', 'Loving'],
           image: dog.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5CV8J+QlTwvdGV4dD48L3N2Zz4=', // Use exact same image source as UserHomepage
           status: dog.status || 'available'
         })) || [];
         
         console.log('Transformed Dogs:', transformedDogs); // Debug log
         
         setFeaturedDogs(transformedDogs);
      } catch (err) {
        console.error('Error fetching featured dogs:', err);
        setError('Failed to load featured dogs');
        
                 // Fallback to placeholder data if API fails - using same placeholder as UserHomepage
         setFeaturedDogs([
           {
             id: "fallback-1",
             name: "Bella",
             breed: "Golden Retriever Mix",
             age: "2 years",
             location: "San Francisco, CA",
             traits: ["Friendly", "Active", "Good with kids"],
             image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wf5CV8J+QlTwvdGV4dD48L3N2Zz4=",
             status: "available"
           },
           {
             id: "fallback-2",
             name: "Rocky",
             breed: "German Shepherd",
             age: "3 years", 
             location: "Austin, TX",
             traits: ["Loyal", "Smart", "Protective"],
             image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wf5CV8J+QlTwvdGV4dD48L3N2Zz4=",
             status: "available"
           },
           {
             id: "fallback-3",
             name: "Daisy",
             breed: "Labrador Mix",
             age: "1 year",
             location: "Denver, CO",
             traits: ["Playful", "Gentle", "Loves water"],
             image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wf5CV8J+QlTwvdGV4dD48L3N2Zz4=",
             status: "available"
           }
         ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDogs();
  }, []);

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

              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Discover the joy of adopting a loving dog from trusted shelters. Our caring process helps you find a loyal companion who'll fill your life with love.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={onGetStarted}
                className="bg-[#1B56FD] text-white hover:bg-[#1444d1] px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Find Your Companion
              </Button>
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
              <div className="text-4xl font-bold text-[#1B56FD] mb-2">2,847</div>
              <div className="text-gray-600">Happy Adoptions</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-[#1B56FD] mb-2">150+</div>
              <div className="text-gray-600">Partner Shelters</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-[#1B56FD] mb-2">89%</div>
              <div className="text-gray-600">Success Rate</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-[#1B56FD] mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#f8faff]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your adoption journey in 4 simple steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've simplified the process to make finding your perfect companion as easy as possible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Browse & Search",
                description: "Explore hundreds of adorable dogs waiting for homes in your area",
                icon: MapPin
              },
              {
                step: "02", 
                title: "Connect & Meet",
                description: "Schedule visits with dogs that match your lifestyle and preferences",
                icon: Heart
              },
              {
                step: "03",
                title: "Apply & Review",
                description: "Complete a simple application process with shelter support",
                icon: CheckCircle
              },
              {
                step: "04",
                title: "Welcome Home",
                description: "Bring your new family member home with ongoing support",
                icon: Users
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-[#1B56FD] rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-[#1B56FD] rounded-full flex items-center justify-center text-[#1B56FD] font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
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
                icon: Zap,
                title: 'Smart Matching',
                description: 'Our algorithm matches you with dogs based on lifestyle, preferences, and compatibility.'
              },
              {
                icon: MessageCircle,
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
                className="bg-[#f8faff] p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#1B56FD] rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-[#f8faff]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success stories from our community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Read heartwarming stories from families who found their perfect companions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                location: "San Francisco, CA",
                story: "Max brought so much joy to our family. The matching process was perfect - he fits right in with our active lifestyle!",
                rating: 5,
                dogName: "Max",
                image: "https://randomuser.me/api/portraits/women/5.jpg"
              },
              {
                name: "Michael Johnson", 
                location: "Austin, TX",
                story: "Luna is the sweetest companion. The shelter staff was incredibly helpful throughout the entire adoption process.",
                rating: 5,
                dogName: "Luna",
                image: "https://randomuser.me/api/portraits/men/5.jpg"
              },
              {
                name: "Emily Rodriguez",
                location: "Denver, CO", 
                story: "Charlie has been the perfect addition to our home. We can't imagine life without him now!",
                rating: 5,
                dogName: "Charlie",
                image: "https://randomuser.me/api/portraits/women/6.jpg"
              }
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{story.story}"</p>
                <div className="flex items-center">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-500">{story.location}</p>
                    <p className="text-sm text-[#1B56FD] font-medium">Adopted {story.dogName}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dogs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dogs looking for homes right now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {loading ? 'Loading available dogs...' : `Meet some of the amazing dogs currently available for adoption`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-[#f8faff] rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="border-[#1B56FD] text-[#1B56FD] hover:bg-[#1B56FD] hover:text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredDogs.map((dog, index) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#f8faff] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                                     <div className="h-64 bg-cover bg-center relative">
                     <img 
                       src={dog.image} 
                       alt={`${dog.name} - ${dog.breed}`}
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5CV8J+QlTwvdGV4dD48L3N2Zz4=';
                       }}
                     />
                   </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{dog.name}</h3>
                    <p className="text-gray-600 mb-1">{dog.breed}</p>
                    <p className="text-gray-500 text-sm mb-4">{dog.age} • {dog.location}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dog.traits.map((trait, i) => (
                        <span key={i} className="px-3 py-1 bg-[#1B56FD]/10 text-[#1B56FD] text-sm rounded-full">
                          {trait}
                        </span>
                      ))}
                    </div>
                                         <Button 
                       onClick={onGetStarted}
                       className="w-full bg-[#1B56FD] text-white hover:bg-[#1444d1] transition-colors"
                     >
                       Meet {dog.name}
                     </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              onClick={onGetStarted}
              variant="outline"
              className="border-[#1B56FD] text-[#1B56FD] hover:bg-[#1B56FD] hover:text-white px-8 py-3 text-lg"
            >
              View All Available Dogs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#f8faff]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about the adoption process
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How long does the adoption process take?",
                answer: "The typical adoption process takes 3-7 days, depending on the shelter's requirements and your application review. Some same-day adoptions are possible for pre-approved adopters."
              },
              {
                question: "What are the adoption fees?",
                answer: "Adoption fees vary by shelter but typically range from $50-$300. This usually includes vaccinations, spaying/neutering, and microchipping."
              },
              {
                question: "Can I return a dog if it doesn't work out?",
                answer: "Yes, most of our partner shelters offer a trial period (usually 2-4 weeks) and will work with you to ensure a successful match or facilitate a return if needed."
              },
              {
                question: "Do you offer support after adoption?",
                answer: "Absolutely! We provide ongoing support including training resources, veterinary referrals, and access to our community of pet parents."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#1B56FD] to-[#3b82f6]">
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
              className="bg-white text-[#1B56FD] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg transform hover:scale-105 transition-all duration-300"
            >
              Begin Your Journey
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    
       {/* Footer Section */}
       <footer className="bg-gray-900 text-white">
         <div className="max-w-6xl mx-auto px-8 py-16">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {/* Company Info */}
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <div className="text-2xl">🐕</div>
                 <h3 className="text-xl font-bold" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                   Happy Strays
                 </h3>
               </div>
               <p className="text-gray-300 text-sm leading-relaxed">
                 Connecting loving families with amazing dogs in need. Making adoption simple, safe, and successful.
               </p>
               <div className="flex space-x-4">
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                   </svg>
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                   </svg>
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                   </svg>
                 </a>
               </div>
             </div>

             {/* Quick Links */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold">Quick Links</h4>
               <ul className="space-y-2 text-sm">
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Browse Dogs</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Success Stories</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
               </ul>
             </div>

             {/* Resources */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold">Resources</h4>
               <ul className="space-y-2 text-sm">
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Adoption Guide</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pet Care Tips</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Training Resources</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Vet Directory</a></li>
                 <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Emergency Contacts</a></li>
               </ul>
             </div>

             {/* Contact Info */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold">Contact Info</h4>
               <div className="space-y-2 text-sm text-gray-300">
                 <div className="flex items-center space-x-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <span>123 Adoption Ave, Pet City, PC 12345</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                   </svg>
                   <span>+1 (555) 123-4567</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                   <span>hello@happystrays.com</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Bottom Section */}
           <div className="border-t border-gray-800 mt-12 pt-8">
             <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
               <div className="text-sm text-gray-400">
                 © 2024 Happy Strays. All rights reserved. Making tails wag, one adoption at a time.
               </div>
               <div className="flex space-x-6 text-sm">
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
               </div>
             </div>
           </div>
         </div>
       </footer>
    </div>
  );
}