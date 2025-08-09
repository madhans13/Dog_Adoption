import { useState, useEffect } from 'react';

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
}

interface RescuerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RescuerDashboard({ isOpen, onClose }: RescuerDashboardProps) {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);

  const fetchRescueRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/rescue');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching rescue requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRescueRequests();
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[90vh] flex flex-col text-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🚨 Rescue Requests Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Requests List */}
          <div className="w-1/2 border-r overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pending Requests</h3>
              <button
                onClick={fetchRescueRequests}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading requests...</div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold text-gray-600">No rescue requests yet</h3>
                <p className="text-gray-500">New requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getDogTypeIcon(request.dogType)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">{request.location}</h4>
                          <p className="text-sm text-gray-600">{getDogTypeLabel(request.dogType)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      Reported by: <span className="font-medium text-gray-700">{request.reporterName}</span> • {new Date(request.submittedAt).toLocaleDateString()}
                    </div>
                    
                    {request.imageUrls.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {request.imageUrls.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Dog ${index + 1}`}
                            className="w-8 h-8 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ))}
                        {request.imageUrls.length > 3 && (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                            +{request.imageUrls.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="w-1/2 overflow-y-auto p-6">
            {selectedRequest ? (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getDogTypeIcon(selectedRequest.dogType)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedRequest.location}</h3>
                      <p className="text-gray-600">{getDogTypeLabel(selectedRequest.dogType)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.toUpperCase()}
                  </span>
                </div>

                {/* Reporter Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">👤 Reporter Information</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-800"><strong>Name:</strong> {selectedRequest.reporterName}</p>
                    <p className="text-gray-800"><strong>Contact:</strong> {selectedRequest.contactDetails}</p>
                    <p className="text-gray-800"><strong>Reported:</strong> {new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📍 Location</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-800">{selectedRequest.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📝 Description</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-800">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Images */}
                {selectedRequest.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📸 Photos ({selectedRequest.imageUrls.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRequest.imageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Dog photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90"
                          onClick={() => window.open(url, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/200/200';
                            target.alt = 'Image not found';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    📞 Contact Reporter
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    ✅ Start Rescue
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-gray-600">Select a rescue request</h3>
                <p className="text-gray-500">Click on a request from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
