import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import RescueRequestModal from "../components/RescueRequestModal";
import RescuerDashboard from "../components/RescuerDashboard";
import AdminDashboard from "../components/AdminDashboard";

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
      const response = await fetch('http://localhost:5000/api/dogs');
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

      const response = await fetch('http://localhost:5000/api/dogs', {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🐕</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dog Adoption Center</h1>
                <p className="text-sm text-gray-600">Find your perfect furry companion!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">Welcome, {user.firstName}!</div>
                    <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  Login / Register
                </Button>
              )}
            
            </div>
          </div>
        </div>
      </header>

      {/* Action Buttons */}
      {user && (
        <div className="container mx-auto px-4 py-6">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleRescueRequest}
                  variant="destructive"
                  className="bg-gradient-to-r from-red-500 to-red-600"
                >
                  🚨 Report Dog for Rescue
                </Button>
                
                {(user.role === 'rescuer' || user.role === 'admin') && (
                  <>
                    <Button
                      onClick={() => setShowForm(!showForm)}
                      variant={showForm ? "outline" : "default"}
                      className={!showForm ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}
                    >
                      {showForm ? 'Cancel' : 'Add New Dog'}
                    </Button>
                    <Button
                      onClick={() => setShowRescuerDashboard(true)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      🚨 Rescue Dashboard
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        onClick={() => setShowAdminDashboard(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600"
                      >
                        🛡️ Admin Dashboard
                      </Button>
                    )}
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
          <Card className="max-w-md mx-auto mb-8 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Add New Dog</CardTitle>
              <CardDescription>Add a dog available for adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter dog's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    required
                    min="0"
                    max="20"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age in years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Dog breed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Current location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about this dog..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600"
                >
                  {submitting ? 'Adding...' : 'Add Dog'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {dogs.map((dog) => (
            <Card key={dog.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="relative">
                {dog.imageUrl ? (
                  <img 
                    src={dog.imageUrl} 
                    alt={dog.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-400 text-6xl">🐕</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                    Available
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-900">{dog.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{dog.age} years</Badge>
                    <Badge variant="outline">{dog.breed}</Badge>
                    <Badge variant="outline">{dog.gender}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">📍 {dog.location}</p>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-700 text-sm leading-relaxed">{dog.description}</p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handleAdoptionRequest(dog)}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  size="lg"
                >
                  {user ? '💕 Adopt Me!' : '🔒 Login to Adopt'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {dogs.length === 0 && (
          <Card className="text-center py-12 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No dogs available yet</h3>
              <p className="text-gray-500">Be the first to add a dog for adoption!</p>
            </CardContent>
          </Card>
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
        <RescuerDashboard
          isOpen={showRescuerDashboard}
          onClose={() => setShowRescuerDashboard(false)}
        />

        <AdminDashboard
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
          userToken={token}
        />
      </div>
    </div>
  );
}
