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
  }, [dogs, searchQuery, ageRange, selectedBreed, selectedGender]);

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
      <header className="bg-[#8DBFF3] shadow-sm border-b border-green-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Happy Strays
              </h1>
            </div>

            {/* Profile - positioned at far right */}
            <div className="flex items-center space-x-4 ml-auto">
                              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{userInitials}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>{displayName}</div>
                      <div className="text-xs text-gray-600 lowercase">{user.role}</div>
                    </div>
                  </div>
                                      <Button 
                      onClick={onLogout}
                      variant="outline" 
                      size="sm"
                      className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1"
                      style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}
                    >
                      Logout
                    </Button>
                </div>
               ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>GUEST</div>
                      <div className="text-xs text-gray-600 lowercase">visitor</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    variant="outline" 
                    size="sm"
                    className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1"
                    style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}
                  >
                    Login
                  </Button>
                </div>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Add top margin back */}
      <div className="py-5"></div>

      <div className="w-full px-5">
        <div className="flex gap-7">
          {/* Sidebar Filters */}
          <div className="w-70 flex-shrink-0 ml-1">
                            <div className="bg-[#DDEB9D] border border-black sticky top-1/2 transform -translate-y-1/2 p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide" style={{ fontFamily: 'Inter Black, sans-serif' }}>
                FILTER
              </h3>

                {/* Age Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 block" style={{ fontFamily: 'Inter Black, sans-serif' }}>
                    Age
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={ageRange}
                      onValueChange={setAgeRange}
                      max={15}
                      min={0}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                      <span>{ageRange[0]} years</span>
                      <span>{ageRange[1]} years</span>
                    </div>
                  </div>
                </div>

                {/* Breed Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 block" style={{ fontFamily: 'Inter Black, sans-serif' }}>
                    Breed
                  </Label>
                  <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="All breeds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All breeds</SelectItem>
                      {getUniqueBreeds().map(breed => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 block" style={{ fontFamily: 'Inter Black, sans-serif' }}>
                    Gender
                  </Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            {/* User Profile Card (Bottom Left) */}
            {user && (
              <div className="bg-black text-white mt-6 sticky border border-black p-4" style={{ top: 'calc(100vh - 120px)' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{userInitials}</span>
                  </div>
                  <div>
                    <div className="font-bold uppercase tracking-wide" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>{displayName}</div>
                    <div className="text-xs text-gray-300">{user.role}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

                     {/* Main Content - Dog Grid */}
           <div className="flex-1 mr-2">
             {/* Main Title and Search Bar */}
             <div className="mb-6">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                   Don't Buy Love, Adopt It!
                 </h2>
                 <div className="flex items-center gap-4">
                   <div className="relative">
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
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{ fontFamily: 'Inter Black, sans-serif' }}
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
               <div className="border border-black rounded-4xl p-8 bg-white">
                                 <div className="grid grid-cols-3 gap-8 justify-items-center">
                    {filteredDogs.map((dog) => (
                                             <Card key={dog.id} className="w-90 border border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] cursor-pointer group bg-[#8DBFF3]">
                      {/* Top section with name and details */}
                      <CardContent className="text-[#F4F6FF]" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                        <h3 className="text-[#F4F6FF] font-bold text-4xl tracking-wide mb-2 uppercase transition-all duration-300 group-hover:scale-105" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                          {dog.name}
                        </h3>
                        <div className="text-[#F4F6FF] font-medium text-sm space-y-1 uppercase mb-4 transition-all duration-300" style={{ fontFamily: 'KBStickToThePlan, sans-serif' }}>
                          <div className="transition-transform duration-300 group-hover:translate-x-1">AGE: {dog.age}</div>
                          <div className="transition-transform duration-300 group-hover:translate-x-1">GENDER: {dog.gender.toUpperCase()}</div>
                        </div>
                        
                        {/* Image section with breed badge and adopt button */}
                        <div className="relative rounded-2xl overflow-hidden -mx-3 -mb-3 h-55">
                          <img
                            src={dog.imageUrl || '/placeholder-dog.jpg'}
                            alt={dog.name}
                            className="w-full h-full object-cover object-center transition-all duration-300 ease-out group-hover:scale-105"
                          />
                          
                          {/* Breed badge overlay */}
                          <div className="absolute top-2 left-2 backdrop-blur-md bg-black/50 border border-white/50 text-white px-7 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-out group-hover:scale-105" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
                            {dog.breed}
                          </div>
                          
                          {/* Adopt button overlay at bottom */}
                          <div className="absolute bottom-2 left-2 right-2">
                                                                                     <Button
                              onClick={() => handleAdoptClick(dog)}
                              className="w-full bg-white text-black font-bold text-sm py-4 rounded-full transition-all duration-300 ease-out shadow-lg hover:shadow-xl uppercase tracking-wide transform hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:scale-95"
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
