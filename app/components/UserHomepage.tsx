import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Slider } from "../components/ui/slider";
import AuthModal from "./AuthModal";
import RescueRequestModal from "./RescueRequestModal";
import SplitText from "./SplitText";
import DogAdoptionNavigation from "./DogAdoptionNavigation";

// Cache for API responses
const dogCache = new Map<string, { data: Dog[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Dog {
  id: string;
  name: string;
  age: number;
  breed: string;
  description: string;
  gender: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface UserHomepageProps {
  user: User | null;
  onLogout: () => void;
  onLogin?: (userData: User, token: string) => void;
}

export default function UserHomepage({ user, onLogout, onLogin }: UserHomepageProps) {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);

  // Filter states
  const [ageRange, setAgeRange] = useState([0, 15]);
  const [selectedBreed, setSelectedBreed] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
   const [selectedSize, setSelectedSize] = useState("all");
   const [selectedEnergy, setSelectedEnergy] = useState("all");
   const [selectedLocation, setSelectedLocation] = useState("all");
   const [goodWithKids, setGoodWithKids] = useState(false);
   const [goodWithDogs, setGoodWithDogs] = useState(false);
   const [goodWithCats, setGoodWithCats] = useState(false);

  // Adoption form state
  const [adoptionForm, setAdoptionForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    experience: "",
    reason: "",
    livingSpace: ""
  });

  useEffect(() => {
    fetchDogs();
  }, []);

     // Debounced search to prevent excessive filtering
     const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
     
     useEffect(() => {
       const timer = setTimeout(() => {
         setDebouncedSearchQuery(searchQuery);
       }, 300); // 300ms debounce
       
       return () => clearTimeout(timer);
     }, [searchQuery]);

     // Optimized filtering with memoization
     const filteredDogs = useMemo(() => {
       if (!Array.isArray(dogs) || dogs.length === 0) {
         return [];
       }
       
       // Early return if no filters applied
       const hasFilters = debouncedSearchQuery || 
         ageRange[0] > 0 || ageRange[1] < 15 ||
         selectedBreed !== "all" || selectedGender !== "all" ||
         selectedSize !== "all" || selectedEnergy !== "all" ||
         selectedLocation !== "all" || goodWithKids || goodWithDogs || goodWithCats;
         
       if (!hasFilters) {
         return dogs;
       }
       
       let filtered = dogs;

       // Search filter
       if (debouncedSearchQuery) {
         const query = debouncedSearchQuery.toLowerCase();
         filtered = filtered.filter(dog => 
           dog.name.toLowerCase().includes(query) ||
           dog.breed.toLowerCase().includes(query) ||
           dog.location.toLowerCase().includes(query)
         );
       }

       // Age filter
       filtered = filtered.filter(dog => 
         dog.age >= ageRange[0] && dog.age <= ageRange[1]
       );

       // Breed filter
       if (selectedBreed !== "all") {
         filtered = filtered.filter(dog => dog.breed === selectedBreed);
       }

       // Gender filter
       if (selectedGender !== "all") {
         filtered = filtered.filter(dog => dog.gender.toLowerCase() === selectedGender);
       }

       // Size filter (if dog has size property)
       if (selectedSize !== "all") {
         filtered = filtered.filter(dog => {
           // This is a placeholder - you'll need to add size property to your Dog interface
           // For now, we'll filter based on breed characteristics
           const dogSize = getDogSize(dog.breed);
           return dogSize === selectedSize;
         });
       }

       // Energy level filter (if dog has energy property)
       if (selectedEnergy !== "all") {
         filtered = filtered.filter(dog => {
           // This is a placeholder - you'll need to add energy property to your Dog interface
           // For now, we'll filter based on breed characteristics
           const dogEnergy = getDogEnergy(dog.breed);
           return dogEnergy === selectedEnergy;
         });
       }

       // Location filter (if dog has location property)
       if (selectedLocation !== "all") {
         filtered = filtered.filter(dog => {
           // This is a placeholder - you'll need to add location property to your Dog interface
           // For now, we'll use the existing location property
           return dog.location.toLowerCase().includes(selectedLocation.toLowerCase());
         });
       }

       // Good with filters (if dog has these properties)
       if (goodWithKids || goodWithDogs || goodWithCats) {
         filtered = filtered.filter(dog => {
           // This is a placeholder - you'll need to add these properties to your Dog interface
           // For now, we'll return all dogs
           return true;
         });
       }

       return filtered;
     }, [dogs, debouncedSearchQuery, ageRange, selectedBreed, selectedGender, selectedSize, selectedEnergy, selectedLocation, goodWithKids, goodWithDogs, goodWithCats]);

  const fetchDogs = useCallback(async () => {
    const cacheKey = 'dogs_list';
    const cached = dogCache.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setDogs(cached.data);
      setLoading(false);
      return;
    }

    try {
      // Start with optimistic UI - show skeleton while loading
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('http://localhost:5000/api/dogs', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🐕 Dogs API response:', data);
        
        let dogsData: Dog[] = [];
        if (Array.isArray(data)) {
          dogsData = data;
        } else if (data && Array.isArray(data.dogs)) {
          dogsData = data.dogs;
        } else {
          console.error('API did not return array format:', data);
          dogsData = [];
        }
        
        // Cache the response
        dogCache.set(cacheKey, { data: dogsData, timestamp: Date.now() });
        setDogs(dogsData);
      } else {
        console.error('Failed to fetch dogs:', response.status, response.statusText);
        setDogs([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timed out - using cached data if available');
        const cached = dogCache.get(cacheKey);
        if (cached) {
          setDogs(cached.data);
        }
      } else {
        console.error('Error fetching dogs:', error);
        setDogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

     // Helper function to determine dog size based on breed
   const getDogSize = (breed: string): string => {
     const smallBreeds = ['chihuahua', 'pomeranian', 'yorkshire', 'maltese', 'shih tzu', 'pug', 'boston terrier'];
     const largeBreeds = ['german shepherd', 'labrador', 'golden retriever', 'rottweiler', 'great dane', 'saint bernard', 'mastiff'];
     
     const breedLower = breed.toLowerCase();
     if (smallBreeds.some(b => breedLower.includes(b))) return 'small';
     if (largeBreeds.some(b => breedLower.includes(b))) return 'large';
     return 'medium';
   };

   // Helper function to determine dog energy level based on breed
   const getDogEnergy = (breed: string): string => {
     const highEnergyBreeds = ['border collie', 'australian shepherd', 'jack russell', 'siberian husky', 'dalmatian', 'boxer'];
     const lowEnergyBreeds = ['bulldog', 'basset hound', 'great dane', 'bernese mountain dog', 'newfoundland', 'chow chow'];
     
     const breedLower = breed.toLowerCase();
     if (highEnergyBreeds.some(b => breedLower.includes(b))) return 'high';
     if (lowEnergyBreeds.some(b => breedLower.includes(b))) return 'low';
     return 'medium';
   };



  const getUniqueBreeds = () => {
    if (!Array.isArray(dogs)) return [];
    const breeds = dogs.map(dog => dog.breed);
    return [...new Set(breeds)];
  };

  // Memoize the animation completion callback to prevent unnecessary re-renders
  const handleLetterAnimationComplete = useCallback(() => {
    console.log("🎭 Quote animation completed!");
  }, []);

  // Memoize the SplitText component to prevent unnecessary re-renders
  const memoizedSplitText = useMemo(() => (
    <SplitText
      text="Don't Buy Love, Adopt It!"
      className="text-7xl font-bold text-gray-900 tracking-tight"
      splitType="words"
      delay={150}
      duration={0.8}
      from={{ opacity: 0, y: 60, rotationX: -90 }}
      to={{ opacity: 1, y: 0, rotationX: 0 }}
      ease="back.out(1.7)"
      threshold={0.3}
      rootMargin="-50px"
      textAlign="left"
      onLetterAnimationComplete={handleLetterAnimationComplete}
      style={{ fontFamily: 'Inter, sans-serif' }}
    />
  ), [handleLetterAnimationComplete]);



  const handleAdoptClick = (dog: Dog) => {
    setSelectedDog(dog);
    setAdoptionForm({
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: "",
      address: "",
      experience: "",
      reason: "",
      livingSpace: ""
    });
    setShowAdoptModal(true);
  };

  const handleAdoptionSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the adoption request to your backend
    console.log("Adoption request submitted:", {
      dog: selectedDog,
      adopter: adoptionForm
    });
    setShowAdoptModal(false);
    // You could show a success message here
  }, [selectedDog, adoptionForm]);

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const displayName = user 
    ? `${user.firstName} ${user.lastName}`.trim() 
    : 'User';

  // Enhanced loading state with premium feel
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
            {/* Inner glow */}
            <div className="absolute inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-bounce">🐕</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding your perfect companion...</h3>
          <p className="text-gray-600">This won't take long</p>
        </div>
      </div>
    );
  }

  return (
           <div className="min-h-screen bg-[#FFFDF6] custom-scrollbar" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
            {/* Header */}

      {/* Add top margin back */}
      <div className="py-5"></div>

      <div className="w-full px-7">
        <div className="flex gap-7">
                     {/* Sidebar Filters - Fixed Position */}
           <div className="w-72 flex-shrink-0 sticky top-0 h-screen bg-gray-50">
             <div className="bg-[#F4F1E8] border border-gray-200 p-6 z-20 rounded-2xl flex flex-col shadow-lg" style={{ height: '90vh' }}>
                                 {/* Filter Content - Two Column Layout */}
                 <div className="flex-1">
                   <h3 className="text-xxl font-extrabold text-gray-900 mb-6 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 1000 }}>
                     Filter
              </h3>

                   {/* Two Column Grid */}
                   <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                     {/* Left Column */}
                     <div className="space-y-4">
                {/* Age Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                    Age
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={ageRange}
                      onValueChange={setAgeRange}
                      max={15}
                      min={0}
                      step={1}
                             className="mb-2 cursor-pointer"
                    />
                           <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{ageRange[0]} years</span>
                      <span>{ageRange[1]} years</span>
                    </div>
                  </div>
                </div>

                {/* Breed Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                    Breed
                  </Label>
                  <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 h-9 text-sm">
                      <SelectValue placeholder="All breeds" />
                    </SelectTrigger>
                           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      <SelectItem value="all">All breeds</SelectItem>
                      {getUniqueBreeds().map(breed => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                    Gender
                  </Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 h-9 text-sm">
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                       </div>

                       {/* Size Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                           Size
                         </Label>
                         <Select value={selectedSize} onValueChange={setSelectedSize}>
                           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 h-9 text-sm">
                             <SelectValue placeholder="All sizes" />
                           </SelectTrigger>
                           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                             <SelectItem value="all">All sizes</SelectItem>
                             <SelectItem value="small">Small</SelectItem>
                             <SelectItem value="medium">Medium</SelectItem>
                             <SelectItem value="large">Large</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     {/* Right Column */}
                     <div className="space-y-4">
                       {/* Energy Level Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                           Energy
                         </Label>
                         <Select value={selectedEnergy} onValueChange={setSelectedEnergy}>
                           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 h-9 text-sm">
                             <SelectValue placeholder="All energy" />
                           </SelectTrigger>
                           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                             <SelectItem value="all">All energy</SelectItem>
                             <SelectItem value="low">Low</SelectItem>
                             <SelectItem value="medium">Medium</SelectItem>
                             <SelectItem value="high">High</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       {/* Location Filter */}
                       <div>
                         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                           Location
                         </Label>
                         <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 h-9 text-sm">
                             <SelectValue placeholder="All locations" />
                           </SelectTrigger>
                           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                             <SelectItem value="all">All locations</SelectItem>
                             <SelectItem value="north">North</SelectItem>
                             <SelectItem value="south">South</SelectItem>
                             <SelectItem value="east">East</SelectItem>
                             <SelectItem value="west">West</SelectItem>
                             <SelectItem value="central">Central</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                      
                       
                       
                     </div>
                   </div>

                   {/* Clear Filters Button - Full Width Below Grid */}
                   <div className="mt-6">
                     <Button
                       onClick={() => {
                         setAgeRange([0, 15]);
                         setSelectedBreed("all");
                         setSelectedGender("all");
                         setSelectedSize("all");
                         setSelectedEnergy("all");
                         setSelectedLocation("all");
                         setGoodWithKids(false);
                         setGoodWithDogs(false);
                         setGoodWithCats(false);
                       }}
                       variant="outline"
                       size="sm"
                       className="w-full border-2 border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-100 transition-all duration-200 font-medium"
                     >
                       🗑️ Clear All Filters
                     </Button>
                </div>
            </div>

    {/* User Profile Card - Fixed at bottom */}
    <div className="mt-auto pt-6 border-t border-gray-500">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">{userInitials}</span>
                  </div>
                  <div>
          <div className="font-extrabold uppercase tracking-wider text-lg" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>{displayName}</div>
          <div className="text-sm text-gray-500 capitalize">{user ? user.role : 'Guest'}</div>
        </div>
      </div>
      
      {/* Login/Logout Button */}
      {user ? (
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="w-full border-2 border-gray-300 text-gray-800 rounded-full px-6 py-2 hover:bg-gray-800 hover:text-white transition-all duration-300 font-medium"
          style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}
        >
          Logout
        </Button>
      ) : (
        <Button 
          onClick={() => setShowAuthModal(true)}
          variant="outline" 
          size="sm"
          className="w-full border-2 border-gray-300 text-gray-800 rounded-full px-6 py-2 hover:bg-gray-800 hover:text-white transition-all duration-300 font-medium"
          style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}
        >
          Login
        </Button>
      )}
                  </div>
                </div>
          </div>

                     {/* Main Content - Dog Grid */}
           <div className="flex-1 mr-2">
             {/* Main Title and Search Bar */}
             <div className="mb-6">
               <div className="flex justify-between items-center mb-4">
                                     <div className="flex-1">
                     {memoizedSplitText}
                   </div>
                 <div className="flex items-center gap-4">
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                     <Input
                       type="text"
                       placeholder="SEARCH"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 h-9.5 rounded-full border-2 border-black bg-white text-sm font-bold uppercase tracking-wide placeholder:text-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                       style={{ fontFamily: 'Inter Black, sans-serif' }}
                     />
                   </div>
                   <Button 
                     onClick={() => {
                       if (user) {
                         setShowRescueModal(true);
                       } else {
                        // Allow guests to access the form but show warning
                        const proceed = confirm("⚠️ GUEST ACCESS WARNING\n\nYou're accessing the rescue reporting form as a guest. While you can view and fill out the form, you'll need to login to actually submit your report.\n\nWould you like to continue? (Recommended: Login first for full access)");
                        if (proceed) {
                          setShowRescueModal(true);
                        } else {
                         setShowAuthModal(true);
                        }
                       }
                     }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                    style={{ fontFamily: 'Inter Black, sans-serif', animationDelay: '0.8s', animationFillMode: 'both' }}
                   >
                    🚨 Report Dog for Rescue
                   </Button>
                 </div>
               </div>
             </div>

                         {filteredDogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No dogs found matching your criteria.</p>
              </div>
            ) : (
                                <div className="border border-black rounded-4xl p-8 animate-grid-entrance">
                                <div className="grid grid-cols-3 gap-8 justify-items-center">
                   {filteredDogs.map((dog, index) => (
                                            <Card 
                        key={dog.id} 
                        className="w-90 border border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] cursor-pointer group bg-[#3DB2FF] animate-card-entrance"
                        style={{ 
                          animationDelay: `${index * 0.08}s`,
                          animationFillMode: 'both'
                        }}
                        onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => {
                          if (e.animationName === 'card-entrance') {
                            e.currentTarget.classList.add('card-hover-effect');
                          }
                        }}
                      >
                     {/* Top section with name and details */}
                     <CardContent className="text-[#F4F6FF]" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                       <h3 className="text-[#FDFDFD] font-bold text-4xl tracking-wide mb-2 uppercase transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ fontFamily: 'KBStickToThePlan, sans-serif', animationDelay: '0.15s' }}>
                         {dog.name}
                       </h3>
                       <div className="text-[#FDFDFD] font-medium text-sm space-y-1 uppercase mb-4 transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                         <div className="transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ animationDelay: '0.2s' }}>AGE: {dog.age}</div>
                         <div className="transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ animationDelay: '0.25s' }}>GENDER: {dog.gender.toUpperCase()}</div>
                       </div>
                       
                       {/* Image section with breed badge and adopt button */}
                       <div className="relative rounded-3xl overflow-hidden -mx-3 -mb-3 h-55">
                         <img
                           src={dog.imageUrl || '/placeholder-dog.jpg'}
                           alt={dog.name}
                            className="w-full h-full object-cover object-center transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            loading="lazy"
                            decoding="async"
                         />
                         
                         {/* Breed badge overlay */}
                         <div className="absolute top-2 left-2 backdrop-blur-md bg-black/50 border border-white/50 text-white px-7 py-1 rounded-full text-sm font-medium transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-105 animate-badge-entrance" style={{ fontFamily: 'Instrument Sans, sans-serif', animationDelay: '0.3s' }}>
                           {dog.breed}
                         </div>
                         
                         {/* Adopt button overlay at bottom */}
                         <div className="absolute bottom-2 left-2 right-2 animate-button-entrance" style={{ animationDelay: '0.35s' }}>
                                                                                    <Button
                             onClick={() => handleAdoptClick(dog)}
                             className="w-full bg-white text-black font-bold text-sm py-4 rounded-full transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) shadow-lg hover:shadow-xl uppercase tracking-wide transform hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:scale-95"
                             style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                           >
                             ADOPT ME
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </div>
           )}
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <Dialog open={showAdoptModal} onOpenChange={setShowAdoptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adopt {selectedDog?.name}</DialogTitle>
            <DialogDescription>
              Please fill out this form to express your interest in adopting {selectedDog?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdoptionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={adoptionForm.fullName}
                onChange={(e) => setAdoptionForm({...adoptionForm, fullName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={adoptionForm.email}
                onChange={(e) => setAdoptionForm({...adoptionForm, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={adoptionForm.phone}
                onChange={(e) => setAdoptionForm({...adoptionForm, phone: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={adoptionForm.address}
                onChange={(e) => setAdoptionForm({...adoptionForm, address: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Experience with pets</Label>
              <Textarea
                id="experience"
                value={adoptionForm.experience}
                onChange={(e) => setAdoptionForm({...adoptionForm, experience: e.target.value})}
                placeholder="Tell us about your experience with pets..."
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Why do you want to adopt {selectedDog?.name}?</Label>
              <Textarea
                id="reason"
                value={adoptionForm.reason}
                onChange={(e) => setAdoptionForm({...adoptionForm, reason: e.target.value})}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdoptModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for guests */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onLogin || (() => {})}
      />

      {/* Rescue Request Modal */}
      <RescueRequestModal 
        isOpen={showRescueModal} 
        onClose={() => setShowRescueModal(false)} 
        onSuccess={() => {
           alert("Rescue request submitted successfully! Rescuers in your area will be notified.");
          setShowRescueModal(false);
        }} 
         user={user}
       />

       {/* Footer Section */}
       <footer className="bg-gray-900 text-white mt-20">
         <div className="max-w-7xl mx-auto px-7 py-16">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {/* Company Info */}
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                   <span className="text-white font-bold text-lg">🐕</span>
                 </div>
                 <h3 className="text-xl font-bold" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                   Dog Adoption
                 </h3>
               </div>
               <p className="text-gray-300 text-sm leading-relaxed">
                 Connecting loving homes with wonderful dogs. Every adoption saves a life and creates a forever family.
               </p>
               <div className="flex space-x-4">
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                   </svg>
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                   </svg>
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                   </svg>
                 </a>
               </div>
             </div>

             {/* Quick Links */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                 Quick Links
               </h4>
               <ul className="space-y-2">
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Browse Dogs
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Report for Rescue
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Adoption Process
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Success Stories
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Volunteer
                   </a>
                 </li>
               </ul>
             </div>

             {/* Support */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                 Support
               </h4>
               <ul className="space-y-2">
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Help Center
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Contact Us
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     FAQ
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Terms of Service
                   </a>
                 </li>
                 <li>
                   <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                     Privacy Policy
                   </a>
                 </li>
               </ul>
             </div>

             {/* Contact Info */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                 Contact Info
               </h4>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3">
                   <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <span className="text-gray-300 text-sm">123 Adoption St, Pet City, PC 12345</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                   </svg>
                   <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                   <span className="text-gray-300 text-sm">hello@dogadoption.com</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Bottom Section */}
           <div className="border-t border-gray-800 mt-12 pt-8">
             <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
               <div className="text-gray-400 text-sm">
                 © 2024 Dog Adoption. All rights reserved. Made with ❤️ for dogs everywhere.
               </div>
               <div className="flex space-x-6">
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                   Accessibility
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                   Sitemap
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                   Cookie Policy
                 </a>
               </div>
             </div>
           </div>
         </div>
       </footer>
    </div>
  );
}
