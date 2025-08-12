import { useState, useEffect } from "react";
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
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
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

     useEffect(() => {
     applyFilters();
   }, [dogs, searchQuery, ageRange, selectedBreed, selectedGender, selectedSize, selectedEnergy, selectedLocation, goodWithKids, goodWithDogs, goodWithCats]);

  const fetchDogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dogs');
      if (response.ok) {
        const data = await response.json();
        console.log('🐕 Dogs API response:', data);
        // Ensure we're setting an array
        if (Array.isArray(data)) {
          setDogs(data);
        } else if (data && Array.isArray(data.dogs)) {
          setDogs(data.dogs);
        } else {
          console.error('API did not return array format:', data);
          setDogs([]);
        }
      } else {
        console.error('Failed to fetch dogs');
        setDogs([]);
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      setDogs([]);
    } finally {
      setLoading(false);
    }
  };

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

   const applyFilters = () => {
     if (!Array.isArray(dogs)) {
       setFilteredDogs([]);
       return;
     }
     let filtered = dogs;

     // Search filter
     if (searchQuery) {
       filtered = filtered.filter(dog => 
         dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         dog.breed.toLowerCase().includes(searchQuery.toLowerCase())
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

     // Location filter
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

     setFilteredDogs(filtered);
   };

     const getUniqueBreeds = () => {
     if (!Array.isArray(dogs)) return [];
     const breeds = dogs.map(dog => dog.breed);
     return [...new Set(breeds)];
   };



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

  const handleAdoptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the adoption request to your backend
    console.log("Adoption request submitted:", {
      dog: selectedDog,
      adopter: adoptionForm
    });
    setShowAdoptModal(false);
    // You could show a success message here
  };

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const displayName = user 
    ? `${user.firstName} ${user.lastName}`.trim() 
    : 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading dogs...</p>
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
          {/* Sidebar Filters */}
{/* Sidebar Filters */}
<div className="w-72 flex-shrink-0 flex flex-col justify-start min-h-screen bg-gray-50">
  <div className="bg-[#FEFBC7] border border-gray-200 p-6 z-20 rounded-0xl flex flex-col shadow-lg" style={{ height: '90vh' }}>
    {/* Filter Content - Takes up available space */}
    <div className="flex-1 overflow-y-auto overflow-x-visible">
      <h3 className="text-xxl font-extrabold text-gray-900 mb-8 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 1000 }}>
        Filter
      </h3>

      {/* Age Filter */}
      <div className="mb-8">
        <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
          Age
        </Label>
        <div className="px-3">
          <Slider
            value={ageRange}
            onValueChange={setAgeRange}
            max={15}
            min={0}
            step={1}
            className="mb-3 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>{ageRange[0]} years</span>
            <span>{ageRange[1]} years</span>
          </div>
        </div>
      </div>

      {/* Breed Filter */}
      <div className="mb-8">
        <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
          Breed
        </Label>
        <Select value={selectedBreed} onValueChange={setSelectedBreed}>
          <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
            <SelectValue placeholder="All breeds" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            <SelectItem value="all">All breeds</SelectItem>
            {getUniqueBreeds().map(breed => (
              <SelectItem key={breed} value={breed}>{breed}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

             {/* Gender Filter */}
       <div className="mb-8">
         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
           Gender
         </Label>
         <Select value={selectedGender} onValueChange={setSelectedGender}>
           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
             <SelectValue placeholder="All genders" />
           </SelectTrigger>
           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
             <SelectItem value="all">All genders</SelectItem>
             <SelectItem value="male">Male</SelectItem>
             <SelectItem value="female">Female</SelectItem>
           </SelectContent>
         </Select>
       </div>

       {/* Size Filter */}
       <div className="mb-8">
         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
           Size
         </Label>
         <Select value={selectedSize} onValueChange={setSelectedSize}>
           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
             <SelectValue placeholder="All sizes" />
           </SelectTrigger>
           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
             <SelectItem value="all">All sizes</SelectItem>
             <SelectItem value="small">Small (under 20 lbs)</SelectItem>
             <SelectItem value="medium">Medium (20-50 lbs)</SelectItem>
             <SelectItem value="large">Large (over 50 lbs)</SelectItem>
           </SelectContent>
         </Select>
       </div>

       {/* Energy Level Filter */}
       <div className="mb-8">
         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
           Energy Level
         </Label>
         <Select value={selectedEnergy} onValueChange={setSelectedEnergy}>
           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
             <SelectValue placeholder="All energy levels" />
           </SelectTrigger>
           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
             <SelectItem value="all">All energy levels</SelectItem>
             <SelectItem value="low">Low (Calm & Relaxed)</SelectItem>
             <SelectItem value="medium">Medium (Moderate Activity)</SelectItem>
             <SelectItem value="high">High (Very Active)</SelectItem>
           </SelectContent>
         </Select>
       </div>

       {/* Location Filter */}
       <div className="mb-8">
         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
           Location
         </Label>
         <Select value={selectedLocation} onValueChange={setSelectedLocation}>
           <SelectTrigger className="bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
             <SelectValue placeholder="All locations" />
           </SelectTrigger>
           <SelectContent className="bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
             <SelectItem value="all">All locations</SelectItem>
             <SelectItem value="north">North Area</SelectItem>
             <SelectItem value="south">South Area</SelectItem>
             <SelectItem value="east">East Area</SelectItem>
             <SelectItem value="west">West Area</SelectItem>
             <SelectItem value="central">Central Area</SelectItem>
           </SelectContent>
         </Select>
       </div>

       {/* Good With Filter */}
       <div className="mb-8">
         <Label className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
           Good With
         </Label>
         <div className="space-y-3">
           <div className="flex items-center space-x-3">
             <input
               type="checkbox"
               id="goodWithKids"
               checked={goodWithKids}
               onChange={(e) => setGoodWithKids(e.target.checked)}
               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
             />
             <Label htmlFor="goodWithKids" className="text-sm text-gray-700">Kids</Label>
           </div>
           <div className="flex items-center space-x-3">
             <input
               type="checkbox"
               id="goodWithDogs"
               checked={goodWithDogs}
               onChange={(e) => setGoodWithDogs(e.target.checked)}
               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
             />
             <Label htmlFor="goodWithDogs" className="text-sm text-gray-700">Other Dogs</Label>
           </div>
           <div className="flex items-center space-x-3">
             <input
               type="checkbox"
               id="goodWithCats"
               checked={goodWithCats}
               onChange={(e) => setGoodWithCats(e.target.checked)}
               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
             />
             <Label htmlFor="goodWithCats" className="text-sm text-gray-700">Cats</Label>
           </div>
         </div>
       </div>

       {/* Clear Filters Button */}
       <div className="mb-8">
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
    <div className="mt-auto pt-6 border-t border-gray-200">
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
                      onLetterAnimationComplete={() => {
                        console.log("🎭 Quote animation completed!");
                      }}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                                   <div className="flex items-center gap-4">
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                      <Input
                        type="text"
                        placeholder="SEARCH"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 h-12 rounded-full border-2 border-black bg-white text-sm font-bold uppercase tracking-wide placeholder:text-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
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
                         className="w-90 border border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] cursor-pointer group bg-[#67B2FF] animate-card-entrance"
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
                        <h3 className="text-[#FFFFFF] font-bold text-4xl tracking-wide mb-2 uppercase transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ fontFamily: 'KBStickToThePlan, sans-serif', animationDelay: '0.15s' }}>
                          {dog.name}
                        </h3>
                        <div className="text-[#F4F6FF] font-medium text-sm space-y-1 uppercase mb-4 transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                          <div className="transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ animationDelay: '0.2s' }}>AGE: {dog.age}</div>
                          <div className="transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) animate-text-slide-in" style={{ animationDelay: '0.25s' }}>GENDER: {dog.gender.toUpperCase()}</div>
                        </div>
                        
                        {/* Image section with breed badge and adopt button */}
                        <div className="relative rounded-2xl overflow-hidden -mx-3 -mb-3 h-55">
                          {/* <img
                            src={dog.imageUrl || '/placeholder-dog.jpg'}
                            alt={dog.name}
                            className="w-full h-full object-cover object-center transition-all duration-300 ease-out group-hover:scale-105"
                          /> */}
                            <img
                             src={dog.imageUrl || '/placeholder-dog.jpg'}
                             alt={dog.name}
                             className="w-full h-full object-cover object-center transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)"
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
    </div>
  );
}
