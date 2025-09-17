import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "../lib/utils";
import { getApiBaseUrl } from "../lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface RescueRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export default function RescueRequestModal({ isOpen, onClose, onSuccess, user }: RescueRequestModalProps) {
  const [formData, setFormData] = useState({
    reporterName: user ? `${user.firstName} ${user.lastName}` : '',
    contactDetails: '',
    location: '',
    dogType: 'stray',
    description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = selectedFiles.length + newFiles.length;

    if (totalFiles > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Check if user is logged in
    if (!user) {
      setError('⚠️ You must be logged in to submit a rescue request. Please login and try again.');
      setSubmitting(false);
      return;
    }

    // Validate required fields
    if (!formData.reporterName.trim()) {
      setError('Reporter name is required');
      setSubmitting(false);
      return;
    }
    if (!formData.contactDetails.trim()) {
      setError('Contact details are required');
      setSubmitting(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      setSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add images
      selectedFiles.forEach(file => {
        submitData.append('images', file);
      });

      // Get token for authenticated request
      const token = localStorage.getItem('token');

      console.log('🚨 Submitting rescue request:', formData);
      console.log('🚨 Selected files:', selectedFiles.length);

      const base = getApiBaseUrl()
      const response = await fetch(`${base}/api/rescue/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();
      console.log('🚨 Rescue request response:', result);

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          reporterName: user ? `${user.firstName} ${user.lastName}` : '',
          contactDetails: '',
          location: '',
          dogType: 'stray',
          description: ''
        });
        setSelectedFiles([]);
        setPreviews([]);
        setError('');
      } else {
        setError(result.error || 'Failed to submit rescue request');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Rescue request error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold !text-gray-800 mb-2" style={{ fontFamily: 'Inter Black, sans-serif' }}>
            🚨 Report Dog for Rescue
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Help us save a dog in need by providing detailed information. Fields marked with * are required.
          </DialogDescription>
          {!user && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ <strong>Guest Mode:</strong> You can view and fill out this form, but you must login to submit your report.
              </p>
            </div>
          )}
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Inter Black, sans-serif' }}>Your Information</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="reporterName" className="text-sm font-medium text-gray-700">Your Name *</Label>
                <Input
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="mt-1 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactDetails" className="text-sm font-medium text-gray-700">Contact Details *</Label>
                <Input
                  id="contactDetails"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleInputChange}
                  placeholder="Phone number or email"
                  className="mt-1 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dog Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Inter Black, sans-serif' }}>Dog Information</h3>
            
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Where is the dog located? Be as specific as possible"
                className="mt-1 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dogType" className="text-sm font-medium text-gray-700">Dog Type *</Label>
              <Select value={formData.dogType} onValueChange={(value) => setFormData({...formData, dogType: value})}>
                <SelectTrigger className="mt-1 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300">
                  <SelectValue placeholder="Select dog type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stray">Stray Dog</SelectItem>
                  <SelectItem value="owned">Owner's Dog (needs help)</SelectItem>
                  <SelectItem value="abandoned">Abandoned Dog</SelectItem>
                  <SelectItem value="injured">Injured Dog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the dog's condition, behavior, size, color, and any immediate needs..."
                className="mt-1 min-h-[100px] focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold !text-gray-800" style={{ fontFamily: 'Inter Black, sans-serif' }}>Photos</h3>
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={() => cameraInputRef.current?.click()} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                📸 Take Photo
              </Button>
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                🖼️ Choose Photos
              </Button>
            </div>
              
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelection(e.target.files)}
              className="hidden"
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelection(e.target.files)}
              className="hidden"
            />
            
            <p className="text-sm text-gray-500">Maximum 5 photos. Clear photos help rescuers assess the situation better.</p>

                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Selected Photos ({previews.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !user}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 font-bold"
              style={{ fontFamily: 'Inter Black, sans-serif' }}
            >
              {submitting ? 'Submitting...' : user ? '🚨 Submit Rescue Request' : '🔒 Login Required'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
