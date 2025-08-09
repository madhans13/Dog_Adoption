import { useState, useRef } from 'react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Report Dog for Rescue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reporter Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name *</label>
              <input
                type="text"
                name="reporterName"
                required
                value={formData.reporterName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Details *</label>
              <input
                type="text"
                name="contactDetails"
                required
                value={formData.contactDetails}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Phone number and/or email"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Dog's Location *</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="Street address or nearby landmark"
            />
          </div>

          {/* Dog Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Dog Type *</label>
            <select
              name="dogType"
              value={formData.dogType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="stray">Stray Dog (needs rescue from street)</option>
              <option value="owned">My Dog (needs to be rescued)</option>
              <option value="abandoned">Abandoned Dog (left by owner)</option>
              <option value="injured">Injured Dog (needs medical attention)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the dog's condition, size, color, any urgent needs..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dog Photos</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  📷 Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  🖼️ Choose Photos
                </button>
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
              
              <p className="text-sm text-gray-500">Maximum 5 photos. Click "Take Photo" to use camera or "Choose Photos" to select from gallery.</p>
            </div>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Photos:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {submitting ? 'Submitting...' : 'Submit Rescue Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
