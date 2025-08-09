import { useState, useEffect } from 'react';

// Shadcn UI Components
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { cn } from "../lib/utils";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

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

interface SystemStats {
  totalUsers: number;
  totalRescuers: number;
  totalAdmins: number;
  totalDogs: number;
  totalRescueRequests: number;
  pendingRequests: number;
  completedRequests: number;
  recentActivity: any[];
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
}

export default function AdminDashboard({ isOpen, onClose, userToken }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rescues' | 'dogs'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch system statistics
  const fetchSystemStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
        if (response.status === 403 || response.status === 401) {
          alert(`Authentication failed (${response.status}). Please logout and login again as admin.`);
        } else {
          alert(`Failed to fetch users: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error connecting to server. Please check if you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all rescue requests
  const fetchRescueRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rescue', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRescueRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching rescue requests:', error);
    }
  };

  // Update user role
  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
        alert('User role updated successfully!');
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  // Update rescue request status
  const updateRescueStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rescue/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchRescueRequests(); // Refresh rescue requests
        fetchSystemStats(); // Refresh stats
        alert(`Rescue request marked as ${newStatus}!`);
      } else {
        alert('Failed to update rescue status');
      }
    } catch (error) {
      console.error('Error updating rescue status:', error);
      alert('Error updating rescue status');
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSystemStats();
      fetchUsers();
      fetchRescueRequests();
    }
  }, [isOpen]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-200 text-red-900 border border-red-300';
      case 'rescuer': return 'bg-blue-200 text-blue-900 border border-blue-300';
      case 'user': return 'bg-green-200 text-green-900 border border-green-300';
      default: return 'bg-gray-200 text-gray-900 border border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': 
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'assigned': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[80vw] w-[80vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🛡️ Admin Dashboard
          </DialogTitle>
          <DialogDescription className="text-white/90">
            Manage users, rescue requests, and system overview
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                📊 Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                👥 Users
              </TabsTrigger>
              <TabsTrigger value="rescues" className="flex items-center gap-2">
                🚨 Rescue Requests
              </TabsTrigger>
              <TabsTrigger value="dogs" className="flex items-center gap-2">
                🐕 Dogs
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h3>
              
                {systemStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-blue-900">{systemStats.totalUsers}</p>
                            <p className="text-xs text-blue-600 mt-1">All registered users</p>
                          </div>
                          <div className="text-3xl text-blue-500">👥</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Total Dogs</p>
                            <p className="text-3xl font-bold text-green-900">{systemStats.totalDogs}</p>
                            <p className="text-xs text-green-600 mt-1">In the system</p>
                          </div>
                          <div className="text-3xl text-green-500">🐕</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-600 text-sm font-medium">Pending Rescues</p>
                            <p className="text-3xl font-bold text-yellow-900">{systemStats.pendingRequests}</p>
                            <p className="text-xs text-yellow-600 mt-1">Need attention</p>
                          </div>
                          <div className="text-3xl text-yellow-500">🚨</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Active Rescuers</p>
                            <p className="text-3xl font-bold text-purple-900">{systemStats.totalRescuers}</p>
                            <p className="text-xs text-purple-600 mt-1">Helping animals</p>
                          </div>
                          <div className="text-3xl text-purple-500">🦸</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

              {/* Additional Stats Row */}
              {systemStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-600 text-sm font-medium">Completed Rescues</p>
                        <p className="text-2xl font-bold text-indigo-900">{systemStats.completedRequests}</p>
                      </div>
                      <div className="text-2xl text-indigo-500">✅</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">Total Rescue Requests</p>
                        <p className="text-2xl font-bold text-orange-900">{systemStats.totalRescueRequests}</p>
                      </div>
                      <div className="text-2xl text-orange-500">📋</div>
                    </div>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-600 text-sm font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-teal-900">
                          {systemStats.totalRescueRequests > 0 
                            ? Math.round((systemStats.completedRequests / systemStats.totalRescueRequests) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="text-2xl text-teal-500">📈</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    👥 Manage Users
                  </button>
                  <button
                    onClick={() => setActiveTab('rescues')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    🚨 View Rescue Requests
                  </button>
                  <button
                    onClick={() => setActiveTab('dogs')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    🐕 Manage Dogs
                  </button>
                </div>
              </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">User Management</h3>
                <button
                  onClick={fetchUsers}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-600">Loading users...</div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-lg text-gray-600 mb-2">No users found</div>
                  <div className="text-sm text-gray-500">Users will appear here once they register or if there are any in the database.</div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="user">User</option>
                              <option value="rescuer">Rescuer</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 ml-2"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </TabsContent>

              <TabsContent value="rescues" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Rescue Request Management</h3>
                <button
                  onClick={fetchRescueRequests}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="grid gap-4">
                {rescueRequests.map((request) => (
                  <div key={request.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800">{request.location}</h4>
                        <p className="text-sm text-gray-600">Reported by: <span className="font-medium">{request.reporterName}</span></p>
                        <p className="text-sm text-gray-600">Contact: <span className="font-medium">{request.contactDetails}</span></p>
                        <p className="text-sm text-gray-600">Type: <span className="font-medium capitalize">{request.dogType}</span></p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded font-medium text-sm ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                        
                        {/* Status Update Buttons */}
                        <div className="flex gap-1">
                          {request.status === 'open' && (
                            <>
                              <button
                                onClick={() => updateRescueStatus(request.id, 'assigned')}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                title="Assign to rescuer"
                              >
                                📋 Assign
                              </button>
                              <button
                                onClick={() => updateRescueStatus(request.id, 'in_progress')}
                                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                                title="Mark in progress"
                              >
                                🚀 Start
                              </button>
                            </>
                          )}
                          
                          {(request.status === 'assigned' || request.status === 'in_progress') && (
                            <button
                              onClick={() => updateRescueStatus(request.id, 'completed')}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                              title="Mark as completed"
                            >
                              ✅ Complete
                            </button>
                          )}
                          
                          {request.status !== 'completed' && (
                            <button
                              onClick={() => updateRescueStatus(request.id, 'cancelled')}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              title="Cancel request"
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">{request.description}</p>
                    
                    {request.imageUrls.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {request.imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Rescue ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      <span>Submitted: {new Date(request.submittedAt).toLocaleString()}</span>
                      <span className="font-medium">ID: #{request.id}</span>
                    </div>
                  </div>
                ))}
              </div>
              </TabsContent>

              <TabsContent value="dogs" className="mt-0 space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Dog Management</h3>
                <Card className="bg-gray-50/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🐕</div>
                    <p className="text-lg text-gray-600">Dog management features coming soon...</p>
                    <p className="text-sm text-gray-500">This will include viewing all dogs, editing details, and managing adoptions.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
