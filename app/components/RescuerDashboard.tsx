import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { cn } from "../lib/utils";
import { getApiBaseUrl } from "../lib/utils";

interface RescueRequest {
  id: number;
  reporterName: string;
  contactDetails: string;
  location: string;
  dogType: string;
  description: string;
  imageUrls: string[];
  status: string;
  submittedAt: string;
  assigned_rescuer_id?: number;
  rescue_completion_notes?: string;
  rescue_photo_url?: string;
  rescued_dog_id?: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface RescuerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export default function RescuerDashboard({ isOpen, onClose, user }: RescuerDashboardProps) {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDogForm, setShowAddDogForm] = useState(false);

  // Add Dog form state
  const [dogForm, setDogForm] = useState({
    name: "",
    age: "",
    breed: "",
    gender: "",
    description: "",
    location: "",
    isRescueCase: false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Rescue completion states
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completingRequest, setCompletingRequest] = useState<RescueRequest | null>(null);
  const [rescuePhoto, setRescuePhoto] = useState<File | null>(null);
  const [rescuePhotoPreview, setRescuePhotoPreview] = useState<string | null>(null);
  const [completionForm, setCompletionForm] = useState({
    dogName: '',
    dogBreed: '',
    dogAge: '',
    dogGender: '',
    dogCondition: '',
    rescueNotes: '',
    dogLocation: ''
  });

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'R';

  const displayName = user 
    ? `${user.firstName} ${user.lastName}`.trim() 
    : 'Rescuer';

  const fetchRescueRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const base = getApiBaseUrl()
      const response = await fetch(`${base}/api/rescue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🚨 Rescue requests fetched:', data);
        console.log('🚨 Number of requests:', data.requests?.length || 0);
        setRequests(data.requests || []);
      } else {
        console.error('❌ Failed to fetch rescue requests:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching rescue requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search query
  const applyFilters = () => {
    let filtered = requests;
    console.log('🔍 Applying filters to requests:', requests.length);

    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.dogType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('🔍 Filtered by search query:', searchQuery, 'Result count:', filtered.length);
    }

    console.log('🔍 Final filtered requests:', filtered.length);
    setFilteredRequests(filtered);
  };

  useEffect(() => {
    if (isOpen) {
      fetchRescueRequests();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [requests, searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRescuePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRescuePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setRescuePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartRescue = async (request: RescueRequest) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    try {
      const base2 = getApiBaseUrl()
      const response = await fetch(`${base2}/api/rescue/${request.id}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchRescueRequests(); // Refresh the list
        // Auto-select the started request
        const updatedRequest = { ...request, status: 'in_progress', assigned_rescuer_id: user?.id };
        setSelectedRequest(updatedRequest);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start rescue');
      }
    } catch (error) {
      console.error('Error starting rescue:', error);
      alert('Failed to start rescue');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRescue = (request: RescueRequest) => {
    setCompletingRequest(request);
    setShowCompletionForm(true);
    setCompletionForm({
      dogName: '',
      dogBreed: '',
      dogAge: '',
      dogGender: '',
      dogCondition: '',
      rescueNotes: '',
      dogLocation: ''
    });
    setRescuePhoto(null);
    setRescuePhotoPreview(null);
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingRequest) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('dogName', completionForm.dogName);
      formData.append('dogBreed', completionForm.dogBreed);
      formData.append('dogAge', completionForm.dogAge);
      formData.append('dogGender', completionForm.dogGender);
      formData.append('dogCondition', completionForm.dogCondition);
      formData.append('rescueNotes', completionForm.rescueNotes);
      formData.append('dogLocation', completionForm.dogLocation);
      
      if (rescuePhoto) {
        formData.append('rescuePhoto', rescuePhoto);
      }
      
      const base3 = getApiBaseUrl()
      const response = await fetch(`${base3}/api/rescue/${completingRequest.id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        await fetchRescueRequests(); // Refresh the list
        setShowCompletionForm(false);
        setCompletingRequest(null);
        setSelectedRequest(null);
        alert('Rescue completed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to complete rescue');
      }
    } catch (error) {
      console.error('Error completing rescue:', error);
      alert('Failed to complete rescue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create FormData for multipart/form-data submission (required for file upload)
      const formData = new FormData();
      formData.append('name', dogForm.name);
      formData.append('age', dogForm.age);
      formData.append('breed', dogForm.breed);
      formData.append('gender', dogForm.gender); // This will now be 'Male' or 'Female'
      formData.append('description', dogForm.description);
      formData.append('location', dogForm.location);
      formData.append('isRescueCase', dogForm.isRescueCase.toString());

      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Get token from localStorage (assuming it's stored there)
      const token = localStorage.getItem('token');

      const base4 = getApiBaseUrl()
      const response = await fetch(`${base4}/api/dogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Required for authenticated endpoint
        },
        body: formData, // Don't set Content-Type header - browser will set it with boundary
      });

      if (response.ok) {
        console.log('Dog added successfully');
        setShowAddDogForm(false);
        // Reset form
        setDogForm({
          name: "",
          age: "",
          breed: "",
          gender: "",
          description: "",
          location: "",
          isRescueCase: false
        });
        setSelectedImage(null);
        setImagePreview(null);
        alert('Dog added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to add dog:', errorData);
        alert(`Failed to add dog: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding dog:', error);
      alert('Error adding dog. Please try again.');
    }
  };

  const getDogTypeIcon = (type: string) => {
    switch (type) {
      case 'stray': return '🏃';
      case 'owned': return '🏠';
      case 'abandoned': return '😢';
      case 'injured': return '🩹';
      default: return '🐕';
    }
  };

  const getDogTypeLabel = (type: string) => {
    switch (type) {
      case 'stray': return 'Stray Dog';
      case 'owned': return 'Owner\'s Dog';
      case 'abandoned': return 'Abandoned Dog';
      case 'injured': return 'Injured Dog';
      default: return 'Dog';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'pending': return 'bg-yellow-200 text-yellow-900 border border-yellow-300';
      case 'assigned': return 'bg-blue-200 text-blue-900 border border-blue-300';
      case 'in_progress': return 'bg-purple-200 text-purple-900 border border-purple-300';
      case 'completed': return 'bg-green-200 text-green-900 border border-green-300';
      default: return 'bg-gray-200 text-gray-900 border border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-green-50 custom-scrollbar-orange" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Happy Strays - Rescuer
              </h1>
            </div>

            {/* Profile - positioned at far right */}
            <div className="flex items-center space-x-4 ml-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userInitials}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Kalam, cursive' }}>{displayName}</div>
                    <div className="text-xs text-gray-600 lowercase">rescuer</div>
                  </div>
                </div>
                <Button 
                  onClick={onClose}
                  variant="outline" 
                  size="sm"
                  className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1"
                  style={{ fontFamily: 'Kalam, cursive' }}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add top margin */}
      <div className="py-8"></div>

      <div className="w-full px-5">
        {/* Main Title and Controls */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Kalam, cursive' }}>
                Rescue Dashboard
              </h2>
              <p className="text-gray-600 font-medium mt-2">
                Manage and respond to rescue requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH REQUESTS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 h-12 rounded-full border-2 border-black bg-white text-sm font-bold uppercase tracking-wide placeholder:text-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 px-6"
                  style={{ fontFamily: 'Kalam, cursive' }}
                />
              </div>
              {/* Add Dog Button */}
              <Button 
                onClick={() => setShowAddDogForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm uppercase tracking-wide"
                style={{ fontFamily: 'Kalam, cursive' }}
              >
                ➕ Add New Dog
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="border border-black rounded-3xl bg-white max-w-full overflow-hidden">
          <div className="flex h-[70vh]">
            {/* Requests List */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6 custom-scrollbar-orange">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>Pending Requests</h3>
                  <p className="text-sm text-gray-600 mt-1">Click on a request to view details</p>
                </div>
                <Button
                  onClick={fetchRescueRequests}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  style={{ fontFamily: 'Kalam, cursive' }}
                >
                  🔄 Refresh
                </Button>
              </div>

            {loading ? (
              <Card className="text-center py-12 bg-green-50 border border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-gray-700" style={{ fontFamily: 'Kalam, cursive' }}>Loading requests...</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredRequests.length === 0 ? (
              <Card className="text-center py-16 bg-green-50 border border-green-200">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">🐕</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3" style={{ fontFamily: 'Kalam, cursive' }}>
                    {searchQuery ? 'No matching requests found' : 'No rescue requests yet'}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {searchQuery ? 'Try adjusting your search terms' : 'New requests will appear here when they\'re submitted'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                      selectedRequest?.id === request.id 
                        ? 'ring-2 ring-orange-500 shadow-lg bg-orange-50 border-orange-200' 
                        : 'bg-white hover:bg-green-50 shadow-md border-gray-200 hover:border-green-300'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg">{getDogTypeIcon(request.dogType)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-lg truncate" style={{ fontFamily: 'Kalam, cursive' }}>{request.location}</h4>
                            <p className="text-sm text-gray-600 font-medium truncate">{getDogTypeLabel(request.dogType)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "font-semibold",
                            request.status === 'open' && "bg-green-100 text-green-700 border-green-200",
                            request.status === 'assigned' && "bg-blue-100 text-blue-700 border-blue-200",
                            request.status === 'in_progress' && "bg-purple-100 text-purple-700 border-purple-200",
                            request.status === 'completed' && "bg-gray-100 text-gray-700 border-gray-200"
                          )}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {request.status === 'in_progress' && request.assigned_rescuer_id === user?.id && (
                            <span className="text-orange-600 font-bold text-sm" style={{ fontFamily: 'Kalam, cursive' }}>
                              YOUR RESCUE
                            </span>
                          )}
                          {request.status === 'in_progress' && request.assigned_rescuer_id !== user?.id && (
                            <span className="text-yellow-600 font-bold text-sm" style={{ fontFamily: 'Kalam, cursive' }}>
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-2 break-words">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                          <span className="font-medium text-gray-700">{request.reporterName}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {request.imageUrls.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            📸 {request.imageUrls.length} photo{request.imageUrls.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      {request.imageUrls.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {request.imageUrls.slice(0, 3).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Dog ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ))}
                          {request.imageUrls.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                              +{request.imageUrls.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

            {/* Request Details */}
            <div className="w-1/2 overflow-y-auto p-6 custom-scrollbar-orange">
            {selectedRequest ? (
              <div className="space-y-6">
                <Card className="border-2 border-gray-200 shadow-lg bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-2xl">{getDogTypeIcon(selectedRequest.dogType)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-800 !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>{selectedRequest.location}</CardTitle>
                          <CardDescription className="text-gray-600 font-medium !text-gray-600">{getDogTypeLabel(selectedRequest.dogType)}</CardDescription>
                        </div>
                      </div>
                      <Badge className={cn(
                        "font-semibold px-3 py-1",
                        selectedRequest.status === 'open' && "bg-green-100 text-green-700 border-green-200",
                        selectedRequest.status === 'assigned' && "bg-blue-100 text-blue-700 border-blue-200",
                        selectedRequest.status === 'in_progress' && "bg-purple-100 text-purple-700 border-purple-200",
                        selectedRequest.status === 'completed' && "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedRequest.status === 'open' || selectedRequest.status === 'assigned' ? (
                    <Button
                      onClick={() => handleStartRescue(selectedRequest)}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg"
                      style={{ fontFamily: 'Kalam, cursive' }}
                    >
                      {loading ? 'Starting...' : 'Start Rescue'}
                    </Button>
                  ) : selectedRequest.status === 'in_progress' && selectedRequest.assigned_rescuer_id === user?.id ? (
                    <Button
                      onClick={() => handleCompleteRescue(selectedRequest)}
                      disabled={loading}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-lg"
                      style={{ fontFamily: 'Kalam, cursive' }}
                    >
                      Complete Rescue
                    </Button>
                  ) : selectedRequest.status === 'in_progress' ? (
                    <div className="flex-1 bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 font-semibold" style={{ fontFamily: 'Kalam, cursive' }}>
                        🚧 Rescue in progress by another rescuer
                      </p>
                    </div>
                  ) : selectedRequest.status === 'completed' ? (
                    <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-gray-700 font-semibold" style={{ fontFamily: 'Kalam, cursive' }}>
                        ✅ Rescue completed
                      </p>
                    </div>
                  ) : null}
                  
                  {/* Contact Reporter Button - Always visible */}
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6"
                    style={{ fontFamily: 'Kalam, cursive' }}
                    onClick={() => {
                      if (selectedRequest.contactDetails) {
                        window.open(`tel:${selectedRequest.contactDetails}`, '_blank');
                      }
                    }}
                  >
                    📞 Contact Reporter
                  </Button>
                </div>

                {/* Reporter Information */}
                <Card className="border-2 border-gray-200 shadow-md bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                      <span className="text-xl">👤</span>
                      Reporter Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm font-medium w-16">Name:</span>
                      <span className="text-gray-800 font-semibold">{selectedRequest.reporterName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm font-medium w-16">Contact:</span>
                      <span className="text-gray-800 font-medium">{selectedRequest.contactDetails}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm font-medium w-16">Reported:</span>
                      <span className="text-gray-800 font-medium">{new Date(selectedRequest.submittedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="border-2 border-gray-200 shadow-md bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                      <span className="text-xl">📍</span>
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 font-medium text-lg">{selectedRequest.location}</p>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="border-2 border-gray-200 shadow-md bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                      <span className="text-xl">📝</span>
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 leading-relaxed">{selectedRequest.description}</p>
                  </CardContent>
                </Card>

                {/* Images */}
                {selectedRequest.imageUrls.length > 0 && (
                  <Card className="border-2 border-gray-200 shadow-md bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                        <span className="text-xl">📸</span>
                        Photos ({selectedRequest.imageUrls.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedRequest.imageUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <img
                              src={url}
                              alt={`Dog photo ${index + 1}`}
                              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/200/200';
                                target.alt = 'Image not found';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">🔍</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}


              </div>
            ) : (
              <Card className="text-center py-20 bg-green-50 border-2 border-gray-200 shadow-lg">
                <CardContent>
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">👈</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3" style={{ fontFamily: 'Kalam, cursive' }}>Select a rescue request</h3>
                  <p className="text-gray-600 font-medium">Click on a request from the list to view details and take action</p>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>

        {/* Add Dog Modal */}
        <Dialog open={showAddDogForm} onOpenChange={setShowAddDogForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold !text-gray-800 mb-2" style={{ fontFamily: 'Inter Black, sans-serif' }}>
                ➕ Add New Dog
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                Add a new dog to the adoption center database. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddDogSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Inter Black, sans-serif' }}>Basic Information</h3>
                
                <div>
                  <Label htmlFor="dogName" className="text-sm font-medium text-gray-700">Dog Name *</Label>
                  <Input
                    id="dogName"
                    value={dogForm.name}
                    onChange={(e) => setDogForm({...dogForm, name: e.target.value})}
                    placeholder="Enter the dog's name"
                    className="mt-1 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dogAge" className="text-sm font-medium text-gray-700">Age (years) *</Label>
                    <Input
                      id="dogAge"
                      type="number"
                      min="0"
                      max="25"
                      value={dogForm.age}
                      onChange={(e) => setDogForm({...dogForm, age: e.target.value})}
                      placeholder="e.g., 3"
                      className="mt-1 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dogGender" className="text-sm font-medium text-gray-700">Gender *</Label>
                    <Select value={dogForm.gender} onValueChange={(value) => setDogForm({...dogForm, gender: value})}>
                      <SelectTrigger className="mt-1 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dogBreed">Breed *</Label>
                  <Input
                    id="dogBreed"
                    value={dogForm.breed}
                    onChange={(e) => setDogForm({...dogForm, breed: e.target.value})}
                    placeholder="e.g., Golden Retriever, Mixed Breed"
                    required
                  />
                </div>
              </div>

              {/* Location & Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>Location & Details</h3>
                
                <div>
                  <Label htmlFor="dogLocation">Current Location *</Label>
                  <Input
                    id="dogLocation"
                    value={dogForm.location}
                    onChange={(e) => setDogForm({...dogForm, location: e.target.value})}
                    placeholder="e.g., Downtown Shelter, Foster Home"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dogDescription">Description *</Label>
                  <Textarea
                    id="dogDescription"
                    value={dogForm.description}
                    onChange={(e) => setDogForm({...dogForm, description: e.target.value})}
                    placeholder="Tell us about this dog's personality, health status, special needs, etc."
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>Photo</h3>
                
                <div>
                  <Label htmlFor="dogImage">Dog Photo</Label>
                  <Input
                    id="dogImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a clear photo of the dog (JPG, PNG, etc.)</p>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <Label>Preview:</Label>
                    <div className="mt-2 border-2 border-gray-200 rounded-lg p-2">
                      <img
                        src={imagePreview}
                        alt="Dog preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Special Options */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>Special Status</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRescueCase"
                    checked={dogForm.isRescueCase}
                    onCheckedChange={(checked) => setDogForm({...dogForm, isRescueCase: checked as boolean})}
                  />
                  <Label htmlFor="isRescueCase" className="text-sm">
                    This is a rescue case (dog was found injured, abandoned, or in distress)
                  </Label>
                </div>
              </div>
              
              <DialogFooter className="gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDogForm(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 font-bold" 
                  style={{ fontFamily: 'Inter Black, sans-serif' }}
                >
                  ➕ Add Dog to Database
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rescue Completion Modal */}
        <Dialog open={showCompletionForm} onOpenChange={setShowCompletionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar-orange">
            <DialogHeader>
              <DialogTitle className="!text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                Complete Rescue
              </DialogTitle>
              <DialogDescription>
                Provide details about the rescued dog and the rescue operation. This information will be added to the database.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitCompletion} className="space-y-6">
              {/* Rescued Dog Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                  Rescued Dog Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rescuedDogName">Dog Name *</Label>
                    <Input
                      id="rescuedDogName"
                      type="text"
                      value={completionForm.dogName}
                      onChange={(e) => setCompletionForm({...completionForm, dogName: e.target.value})}
                      placeholder="e.g., Lucky, Buddy"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rescuedDogAge">Age (years) *</Label>
                    <Input
                      id="rescuedDogAge"
                      type="number"
                      min="0"
                      max="20"
                      value={completionForm.dogAge}
                      onChange={(e) => setCompletionForm({...completionForm, dogAge: e.target.value})}
                      placeholder="e.g., 2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rescuedDogBreed">Breed *</Label>
                    <Input
                      id="rescuedDogBreed"
                      type="text"
                      value={completionForm.dogBreed}
                      onChange={(e) => setCompletionForm({...completionForm, dogBreed: e.target.value})}
                      placeholder="e.g., Labrador, Mixed"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rescuedDogGender">Gender *</Label>
                    <Select 
                      value={completionForm.dogGender} 
                      onValueChange={(value) => setCompletionForm({...completionForm, dogGender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Rescue Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                  Rescue Details
                </h3>
                
                <div>
                  <Label htmlFor="dogCondition">Dog's Current Condition *</Label>
                  <Select 
                    value={completionForm.dogCondition} 
                    onValueChange={(value) => setCompletionForm({...completionForm, dogCondition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="minor_injuries">Minor Injuries</SelectItem>
                      <SelectItem value="major_injuries">Major Injuries</SelectItem>
                      <SelectItem value="malnourished">Malnourished</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="critical">Critical Condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dogLocation">Current Location *</Label>
                  <Input
                    id="dogLocation"
                    type="text"
                    value={completionForm.dogLocation}
                    onChange={(e) => setCompletionForm({...completionForm, dogLocation: e.target.value})}
                    placeholder="e.g., Veterinary Clinic, Rescue Center"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rescueNotes">Rescue Notes</Label>
                  <Textarea
                    id="rescueNotes"
                    value={completionForm.rescueNotes}
                    onChange={(e) => setCompletionForm({...completionForm, rescueNotes: e.target.value})}
                    placeholder="Describe the rescue operation, dog's behavior, any treatments given, etc."
                    rows={4}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Kalam, cursive' }}>
                  Current Photo
                </h3>
                
                <div>
                  <Label htmlFor="rescuePhoto">Upload Current Photo of the Dog</Label>
                  <Input
                    id="rescuePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleRescuePhotoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a recent photo showing the dog's current condition
                  </p>
                </div>
                
                {rescuePhotoPreview && (
                  <div className="mt-4">
                    <Label>Preview:</Label>
                    <div className="mt-2 border-2 border-gray-200 rounded-lg p-2">
                      <img
                        src={rescuePhotoPreview}
                        alt="Rescue photo preview"
                        className="w-48 h-48 object-cover rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCompletionForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600" 
                  style={{ fontFamily: 'Kalam, cursive' }}
                >
                  {loading ? 'Completing...' : 'Complete Rescue'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}