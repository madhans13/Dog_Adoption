import { useState, useEffect } from 'react';
import { AppSidebar } from "~/components/app-sidebar";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SiteHeader } from "~/components/site-header";
import { SectionCards } from "~/components/section-cards";
import { 
  SidebarInset, 
  SidebarProvider 
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";

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
  assignedRescuer?: string;
  assignedRescuerId?: number;
}

interface SystemStats {
  totalUsers: number;
  totalRescuers: number;
  totalAdmins: number;
  totalDogs: number;
  totalRescueRequests: number;
  pendingRequests: number;
  completedRequests: number;
  completedRescues: number;
  recentActivity: any[];
}

// Column definitions for tables - these will be defined inside the component to access functions
const createUserColumns = (onRoleChange: (userId: number, newRole: string) => void): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === 'admin' ? 'destructive' : role === 'rescuer' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRoleChange(user.id, user.role === 'user' ? 'rescuer' : 'user')}
            className="text-xs"
          >
            {user.role === 'user' ? '↗️ Promote' : '↙️ Demote'}
          </Button>
        </div>
      );
    },
  },
];

const createRescueColumns = (onStatusChange: (requestId: number, newStatus: string) => void): ColumnDef<RescueRequest>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "dogType",
    header: "Dog Type",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "reporterName",
    header: "Reporter",
  },
  {
    accessorKey: "assignedRescuer",
    header: "Assigned Rescuer",
    cell: ({ row }) => {
      const request = row.original;
      return request.assignedRescuer ? (
        <span className="text-sm font-medium text-blue-700">
          {request.assignedRescuer}
        </span>
      ) : (
        <span className="text-xs text-gray-400">Unassigned</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={
          status === 'pending' || status === 'open' ? 'destructive' : 
          status === 'in_progress' || status === 'assigned' ? 'default' : 
          'secondary'
        }>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt"));
      return (
        <span className="text-xs text-gray-600">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      const currentStatus = request.status;
      
      return (
        <div className="flex gap-1">
          {currentStatus === 'pending' || currentStatus === 'open' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(request.id, 'assigned')}
              className="text-xs bg-blue-50 hover:bg-blue-100"
            >
              📋 Assign
            </Button>
          ) : currentStatus === 'assigned' || currentStatus === 'in_progress' ? (
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(request.id, 'completed')}
                className="text-xs bg-green-50 hover:bg-green-100"
              >
                ✅ Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(request.id, 'cancelled')}
                className="text-xs bg-red-50 hover:bg-red-100"
              >
                ❌ Cancel
              </Button>
            </div>
          ) : (
            <span className="text-xs text-gray-500 px-2 py-1">
              {currentStatus === 'completed' ? '✅ Done' : '❌ Cancelled'}
            </span>
          )}
        </div>
      );
    },
  },
];

interface AdminDashboardNewProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
}

export default function AdminDashboardNew({ isOpen, onClose, userToken }: AdminDashboardNewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Admin Dashboard opened, fetching data...');
      fetchSystemStats();
      fetchUsers();
      fetchRescueRequests();
    }
  }, [isOpen, userToken]);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Stats fetched:', data);
        setSystemStats({
          totalUsers: data.totalUsers,
          totalDogs: data.totalDogs,
          pendingRequests: data.pendingRequests,
          completedRescues: data.completedRescues,
          totalRescuers: data.totalRescuers
        });
      } else {
        console.error('❌ Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Users fetched:', data);
        // Map the backend user structure to our frontend interface
        const mappedUsers = (data.users || []).map((user: any) => ({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role
        }));
        console.log('👥 Mapped users:', mappedUsers);
        setUsers(mappedUsers);
      } else {
        console.error('❌ Failed to fetch users:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRescueRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/rescue-requests', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🚨 Rescue requests fetched:', data);
        // Map the backend rescue request structure to our frontend interface
        const mappedRequests = (data.requests || []).map((request: any) => ({
          id: request.id,
          dogType: request.dogType,
          location: request.location,
          reporterName: request.reporterName,
          status: request.status === 'open' ? 'pending' : request.status,
          submittedAt: request.submittedAt,
          imageUrls: request.imageUrls || [],
          assignedRescuer: request.assignedRescuer ? 
            `${request.assignedRescuer.firstName} ${request.assignedRescuer.lastName}` : null,
          assignedRescuerId: request.assignedRescuerId
        }));
        console.log('🚨 Mapped rescue requests:', mappedRequests);
        setRescueRequests(mappedRequests);
      } else {
        console.error('❌ Failed to fetch rescue requests:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching rescue requests:', error);
    }
  };

  // Handler functions for actions
  const handleRoleChange = async (userId: number, newRole: string) => {
    console.log('🔄 Changing user role:', userId, 'to', newRole);
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
        console.log('✅ User role updated successfully');
        // Refresh the users list
        fetchUsers();
        // Also refresh stats since they depend on user roles
        fetchSystemStats();
      } else {
        console.error('❌ Failed to update user role:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    console.log('🔄 Changing rescue request status:', requestId, 'to', newStatus);
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
        console.log('✅ Rescue request status updated successfully');
        // Refresh the rescue requests list
        fetchRescueRequests();
        // Also refresh stats since they depend on request statuses
        fetchSystemStats();
      } else {
        console.error('❌ Failed to update rescue request status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating rescue request status:', error);
    }
  };

  // Generate columns with action handlers
  const userColumns = createUserColumns(handleRoleChange);
  const rescueColumns = createRescueColumns(handleStatusChange);

  // Function to render different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardView();
      case 'users':
        return renderUsersView();
      case 'rescue-requests':
        return renderRescueRequestsView();
      case 'dogs':
        return renderDogsView();
      case 'analytics':
        return renderAnalyticsView();
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <>
      {/* Statistics Cards */}
      {systemStats && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-semibold">Total Users</p>
                  <p className="text-3xl font-bold text-white">{systemStats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-semibold">Total Dogs</p>
                  <p className="text-3xl font-bold text-white">{systemStats.totalDogs}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🐕</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-semibold">Pending Requests</p>
                  <p className="text-3xl font-bold text-white">{systemStats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🚨</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-semibold">Active Rescuers</p>
                  <p className="text-3xl font-bold text-white">{systemStats.totalRescuers}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🦸</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Chart */}
      <ChartAreaInteractive />

      {/* Quick Overview */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>👥</span> Recent Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{user.firstName} {user.lastName}</span>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>{user.role}</Badge>
              </div>
            ))}
            <button 
              onClick={() => setActiveSection('users')}
              className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              View all users →
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🚨</span> Recent Requests ({rescueRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rescueRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{request.dogType} - {request.location}</span>
                <Badge variant={request.status === 'pending' ? 'destructive' : 'default'}>{request.status}</Badge>
              </div>
            ))}
            <button 
              onClick={() => setActiveSection('rescue-requests')}
              className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              View all requests →
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderUsersView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">👥 User Management</h2>
        <Badge variant="secondary">{users.length} total users</Badge>
      </div>
      <Card>
        <CardContent className="p-6">
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'rescuer' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <button 
                      onClick={() => handleRoleChange(user.id, user.role === 'user' ? 'rescuer' : 'user')}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      {user.role === 'user' ? '↗️ Promote' : '↙️ Demote'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRescueRequestsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🚨 Rescue Requests</h2>
        <Badge variant="secondary">{rescueRequests.length} total requests</Badge>
      </div>
      <Card>
        <CardContent className="p-6">
          {rescueRequests.length > 0 ? (
            <div className="space-y-3">
              {rescueRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-medium">{request.dogType}</div>
                    <div className="text-sm text-gray-500">{request.location} • by {request.reporterName}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      request.status === 'pending' || request.status === 'open' ? 'destructive' : 
                      request.status === 'in_progress' ? 'default' : 
                      'secondary'
                    }>
                      {request.status}
                    </Badge>
                    {request.status === 'pending' || request.status === 'open' ? (
                      <button
                        onClick={() => handleStatusChange(request.id, 'in_progress')}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        🚀 Start
                      </button>
                    ) : request.status === 'in_progress' ? (
                      <button
                        onClick={() => handleStatusChange(request.id, 'completed')}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        ✅ Complete
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 px-3 py-1">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No rescue requests found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDogsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🐕 Dogs Management</h2>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-xl font-semibold mb-2">Dogs Management</h3>
          <p className="text-gray-600 mb-4">Manage all dogs available for adoption</p>
          <p className="text-sm text-gray-500">This section will show all dogs with their adoption status, health records, and management options.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📈 Analytics</h2>
        <Badge variant="secondary">Live Data</Badge>
      </div>
      <div className="space-y-6">
        <ChartAreaInteractive />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>📊 System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Database Size</span>
                  <Badge variant="secondary">2.4 GB</Badge>
                </div>
                <div className="flex justify-between">
                  <span>API Response Time</span>
                  <Badge variant="secondary">120ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Sessions</span>
                  <Badge variant="secondary">12</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🎯 Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <Badge variant="secondary">99.9%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <Badge variant="secondary">0.1%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Requests/Hour</span>
                  <Badge variant="secondary">1,247</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="w-full h-full bg-white flex flex-col">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "19rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <SidebarInset className="flex flex-col h-full">
            <SiteHeader />
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
              {/* Close Button */}
              <div className="flex justify-end">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  ✕ Close Dashboard
                </Button>
              </div>

              {/* Dynamic Content Based on Active Section */}
              {renderContent()}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}