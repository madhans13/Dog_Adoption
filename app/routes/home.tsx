import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { Meta } from "react-router";
import AuthModal from "../components/AuthModal";
import RescueRequestModal from "../components/RescueRequestModal";
import RescuerDashboard from "../components/dashboard/rescuer/RescuerDashboard";
import AdminDashboard from "../components/dashboard/admin/AdminDashboard";
import UserHomepage from "../components/UserHomepage";

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { cn } from "../lib/utils";
import { getApiBaseUrl } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dog Adoption Center" },
    { name: "description", content: "Find your perfect furry companion!" },
  ];
}

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

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    description: '',
    gender: 'Male',
    location: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [selectedDogForAdoption, setSelectedDogForAdoption] = useState<Dog | null>(null);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [showRescuerDashboard, setShowRescuerDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Fetch dogs
  const fetchDogs = async () => {
    try {
      const base = getApiBaseUrl();
      const response = await fetch(`${base}/api/dogs`);
      const data = await response.json();
      setDogs(data.dogs || data); // Handle both new and old API response formats
    } catch (error) {
      console.error('Error fetching dogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit new dog
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('breed', formData.breed);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('location', formData.location);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const base2 = getApiBaseUrl()
      const response = await fetch(`${base2}/api/dogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          age: '',
          breed: '',
          description: '',
          gender: 'Male',
          location: ''
        });
        setSelectedFile(null);
        setShowForm(false);
        
        // Refresh dogs list
        fetchDogs();
      } else {
        alert('Error adding dog');
      }
    } catch (error) {
      console.error('Error submitting dog:', error);
      alert('Error adding dog');
    } finally {
      setSubmitting(false);
    }
  };

  // Check for existing authentication on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    fetchDogs();
  }, []);

  // Handle authentication success
  const handleAuthSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken('');
  };

  // Handle adoption request
  const handleAdoptionRequest = (dog: Dog) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedDogForAdoption(dog);
    setShowAdoptionModal(true);
  };

  // Handle rescue request
  const handleRescueRequest = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowRescueModal(true);
  };

  // Handle rescue success
  const handleRescueSuccess = () => {
    alert('🎉 Rescue request submitted successfully! A rescuer will contact you soon.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-medium">Loading dogs...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is admin, show dashboard directly as the main page
  if (user && user.role === 'admin') {
    return (
      <AdminDashboard
        isOpen={true}
        onClose={() => {
          // Admin logout instead of just closing dashboard
          handleLogout();
        }}
        userToken={token}
      />
    );
  }

  // If user is rescuer, show dashboard as main page (auto-open for rescuers)
  if (user && user.role === 'rescuer') {
    return (
      <RescuerDashboard
        isOpen={true}
        onClose={() => {
          // Rescuer logout instead of just closing dashboard
          handleLogout();
        }}
        user={user}
      />
    );
  }

  // For regular users (including guests), show the new homepage design
  if (!user || user.role === 'user') {
    return (
      <UserHomepage 
        user={user}
        onLogout={handleLogout}
        onLogin={handleAuthSuccess}
      />
    );
  }

  // For rescuer users (when dashboard is not open), show the rescuer interface

  return (
    <>
      <Meta />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">🐕</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Paws & Hearts
                </h1>
                <p className="text-sm text-gray-500 font-medium">Find your perfect furry companion!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">Welcome back, {user.firstName}!</div>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-medium",
                          user.role === 'admin' && "bg-red-100 text-red-700 border-red-200",
                          user.role === 'rescuer' && "bg-amber-100 text-amber-700 border-amber-200",
                          user.role === 'user' && "bg-blue-100 text-blue-700 border-blue-200"
                        )}
                      >
                        {user.role === 'admin' && '🛡️ Admin'}
                        {user.role === 'rescuer' && '🚨 Rescuer'}
                        {user.role === 'user' && '👤 User'}
                      </Badge>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white">
                      {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">Logout</span>
                      <span className="sm:hidden">👋</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6"
                >
                  <span className="hidden sm:inline">Login / Register</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Action Buttons - Hidden for admin users as they have dedicated dashboard */}
      {user && user.role !== 'admin' && (
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="pt-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={handleRescueRequest}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3 text-base"
                >
                  🚨 Report Dog for Rescue
                </Button>
                
                {(user.role === 'rescuer' || user.role === 'admin') && (
                  <>
                    <Button
                      onClick={() => setShowForm(!showForm)}
                      variant={showForm ? "outline" : "default"}
                      className={cn(
                        "font-semibold px-6 py-3 text-base transition-all duration-200",
                        !showForm 
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl" 
                          : "border-gray-300 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      {showForm ? '✕ Cancel' : '➕ Add New Dog'}
                    </Button>
                    <Button
                      onClick={() => setShowRescuerDashboard(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3 text-base"
                    >
                      🚨 Rescue Dashboard
                    </Button>

                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Add Dog Form - Only for Rescuers and Admins */}
        {showForm && user && (user.role === 'rescuer' || user.role === 'admin') && (
          <Card className="max-w-2xl mx-auto mb-8 bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🐕</span>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Add New Dog
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Help a furry friend find their forever home
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Dog's Name</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter dog's name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      min="0"
                      max="20"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age in years"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="breed" className="text-sm font-semibold text-gray-700">Breed</Label>
                    <Input
                      id="breed"
                      type="text"
                      required
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      placeholder="Dog breed"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">🐕 Male</SelectItem>
                        <SelectItem value="Female">🐕 Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Current Location</Label>
                  <Input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about this dog's personality, behavior, special needs..."
                    rows={4}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="photo" className="text-sm font-semibold text-gray-700">Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-600 font-medium">Click to upload a photo</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG up to 10MB</p>
                      {selectedFile && (
                        <p className="text-blue-600 text-sm mt-2 font-medium">✓ {selectedFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold py-3 text-base"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding Dog...
                    </span>
                  ) : (
                    '🐕 Add Dog for Adoption'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dogs Grid - Hidden for admin users */}
        {user && user.role !== 'admin' && (
          <>
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Available Dogs
                </h2>
                <p className="text-gray-600 font-medium">Find your perfect companion</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dogs.map((dog) => (
                  <Card key={dog.id} className="group bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                    <div className="relative overflow-hidden">
                      {dog.imageUrl ? (
                        <img 
                          src={dog.imageUrl} 
                          alt={dog.name}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                          <span className="text-gray-400 text-7xl transform transition-transform duration-500 group-hover:scale-110">🐕</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500/90 text-white border-0 shadow-lg backdrop-blur-sm">
                          ✨ Available
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="flex space-x-1">
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                            {dog.age} yrs
                          </Badge>
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                            {dog.gender}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                        {dog.name}
                        <span className="text-lg">💖</span>
                      </CardTitle>
                      <CardDescription className="space-y-2">
                        <Badge variant="outline" className="mr-2 border-blue-200 text-blue-700 bg-blue-50">
                          {dog.breed}
                        </Badge>
                        <div className="flex items-center text-gray-600 mt-2">
                          <span className="text-sm">📍</span>
                          <span className="text-sm ml-1 font-medium">{dog.location}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0 pb-4">
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {dog.description}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button 
                        onClick={() => handleAdoptionRequest(dog)}
                        className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-3 text-base"
                        size="lg"
                      >
                        {user ? '💕 Adopt Me!' : '🔒 Login to Adopt'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {dogs.length === 0 && (
              <Card className="text-center py-16 bg-white/90 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">🐕</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No dogs available yet</h3>
                  <p className="text-gray-600 font-medium">Be the first to add a furry friend for adoption!</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Simple Adoption Modal */}
        {showAdoptionModal && selectedDogForAdoption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Adopt {selectedDogForAdoption.name}</h2>
                <button
                  onClick={() => setShowAdoptionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <img 
                  src={selectedDogForAdoption.imageUrl || ''} 
                  alt={selectedDogForAdoption.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-700">
                  <strong>{selectedDogForAdoption.name}</strong> is a {selectedDogForAdoption.age} year old {selectedDogForAdoption.breed} from {selectedDogForAdoption.location}.
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  🎉 Great! You're interested in adopting {selectedDogForAdoption.name}!
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  The full adoption system with requests and approvals will be available once the backend is fully set up.
                </p>
                <button
                  onClick={() => setShowAdoptionModal(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rescue Request Modal */}
        <RescueRequestModal
          isOpen={showRescueModal}
          onClose={() => setShowRescueModal(false)}
          onSuccess={handleRescueSuccess}
        />

        {/* Rescuer Dashboard */}


        <AdminDashboard
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
          userToken={token}
        />
      </div>
    </div>
    </>
  );
}
