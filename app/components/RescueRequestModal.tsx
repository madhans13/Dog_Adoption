import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "../lib/utils";

interface RescueRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescueRequestModal({ isOpen, onClose, onSuccess }: RescueRequestModalProps) {
  const [formData, setFormData] = useState({
    reporterName: '',
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

      const response = await fetch('http://localhost:5000/api/rescue', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          reporterName: '',
          contactDetails: '',
          location: '',
          dogType: 'stray',
          description: ''
        });
        setSelectedFiles([]);
        setPreviews([]);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <CardHeader className="border-b border-gray-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Report Dog for Rescue
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Help us save a dog in need by providing detailed information
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 h-10 w-10 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reporter Information */}
            <Card className="border border-gray-200 bg-gray-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Your Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact details so we can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="reporterName" className="text-sm font-semibold text-gray-700">Your Name *</Label>
                    <Input
                      id="reporterName"
                      name="reporterName"
                      type="text"
                      required
                      value={formData.reporterName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contactDetails" className="text-sm font-semibold text-gray-700">Contact Details *</Label>
                    <Input
                      id="contactDetails"
                      name="contactDetails"
                      type="text"
                      required
                      value={formData.contactDetails}
                      onChange={handleInputChange}
                      placeholder="Phone number and/or email"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dog Information */}
            <Card className="border border-gray-200 bg-blue-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">🐕</span>
                  Dog Information
                </CardTitle>
                <CardDescription>
                  Tell us about the dog that needs rescue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Dog's Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Street address or nearby landmark"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dogType" className="text-sm font-semibold text-gray-700">Dog Type *</Label>
                  <Select value={formData.dogType} onValueChange={(value) => setFormData(prev => ({ ...prev, dogType: value }))}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                      <SelectValue placeholder="Select dog type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stray">🏃 Stray Dog (needs rescue from street)</SelectItem>
                      <SelectItem value="owned">🏠 My Dog (needs to be rescued)</SelectItem>
                      <SelectItem value="abandoned">😢 Abandoned Dog (left by owner)</SelectItem>
                      <SelectItem value="injured">🩹 Injured Dog (needs medical attention)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the dog's condition, size, color, any urgent needs..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="border border-gray-200 bg-purple-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">📸</span>
                  Dog Photos
                </CardTitle>
                <CardDescription>
                  Add photos to help rescuers identify the dog (maximum 5 photos)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                  >
                    📷 Take Photo
                  </Button>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50 font-semibold"
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
                
                <p className="text-sm text-gray-500 text-center">Maximum 5 photos. Click "Take Photo" to use camera or "Choose Photos" to select from gallery.</p>

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
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  '🚨 Submit Rescue Request'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
