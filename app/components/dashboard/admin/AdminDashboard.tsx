import * as React from "react"
import { useState, useEffect } from "react"
import {
  Users,
  Heart,
  UserCheck,
  Settings,
  Database,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react"

import { AppSidebar } from "../ui/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb"
import { Separator } from "../../ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar"
import { DashboardCard, DashboardCardContent, DashboardCardDescription, DashboardCardHeader, DashboardCardTitle } from "../ui/dashboard-card"
import { DashboardButton } from "../ui/dashboard-button"
import { DashboardBadge } from "../ui/dashboard-badge"

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
  userToken: string
}

interface Stats {
  totalUsers: number
  totalDogs: number
  pendingAdoptions: number
  rescueRequests: number
}

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface RescueRequest {
  id: number
  description: string
  location: string
  urgency: string
  status: string
  reporterName: string
  createdAt: string
}

export default function AdminDashboard({ isOpen, onClose, userToken }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDogs: 0,
    pendingAdoptions: 0,
    rescueRequests: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  // Dashboard data configuration for shadcn
  const dashboardData = {
    user: {
      name: "Admin User",
      email: "admin@dogadoption.com",
      avatar: "/avatars/admin.jpg",
    },
    teams: [
      {
        name: "🐕 Happy Strays",
        logo: Heart,
        plan: "Admin Panel",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: Activity,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "#",
          },
          {
            title: "Analytics",
            url: "#",
          },
        ],
      },
      {
        title: "User Management",
        url: "#",
        icon: Users,
        items: [
          {
            title: "All Users",
            url: "#",
          },
          {
            title: "Roles",
            url: "#",
          },
          {
            title: "Permissions",
            url: "#",
          },
        ],
      },
      {
        title: "Content Management",
        url: "#",
        icon: Database,
        items: [
          {
            title: "Dogs",
            url: "#",
          },
          {
            title: "Adoptions",
            url: "#",
          },
          {
            title: "Rescue Requests",
            url: "#",
          },
        ],
      },
      {
        title: "System",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Settings",
            url: "#",
          },
          {
            title: "Logs",
            url: "#",
          },
          {
            title: "Backups",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "System Reports",
        url: "#",
        icon: FileText,
      },
      {
        name: "Analytics",
        url: "#",
        icon: TrendingUp,
      },
      {
        name: "Security",
        url: "#",
        icon: Shield,
      },
    ],
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      fetchUsers()
      fetchRescueRequests()
    }
  }, [isOpen, userToken])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Ensure data is always an array
        if (data && Array.isArray(data.users)) {
          setUsers(data.users)
        } else if (Array.isArray(data)) {
          setUsers(data)
        } else {
          console.warn('Unexpected API response format:', data)
          setUsers([])
        }
      } else {
        console.error('Failed to fetch users:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchRescueRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/rescue-requests', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Ensure data is always an array
        if (data && Array.isArray(data.requests)) {
          setRescueRequests(data.requests)
        } else if (Array.isArray(data)) {
          setRescueRequests(data)
        } else {
          console.warn('Unexpected API response format:', data)
          setRescueRequests([])
        }
      } else {
        console.error('Failed to fetch rescue requests:', response.status)
        setRescueRequests([])
      }
    } catch (error) {
      console.error('Error fetching rescue requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleRescueStatusChange = async (requestId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rescue/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchRescueRequests()
      }
    } catch (error) {
      console.error('Error updating rescue status:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50">
      <SidebarProvider>
                 <AppSidebar 
           data={dashboardData} 
           onLogout={onClose} 
           onNavigate={(section) => setActiveSection(section)}
           activeSection={activeSection}
         />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Admin Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-4">
              <DashboardButton onClick={onClose} variant="outline" size="sm">
                Logout
              </DashboardButton>
            </div>
          </header>
          
                     <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
              {['overview', 'analytics', 'all users', 'roles', 'permissions', 'dogs', 'adoptions', 'rescue requests', 'settings', 'logs', 'backups'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap ${
                    activeSection === section
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>

                         {/* Content based on active section */}
             {activeSection === 'overview' && (
               <>
                 {/* Stats Cards */}
                 <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                   <DashboardCard variant="stats">
                     <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <DashboardCardTitle className="text-sm font-medium">Total Users</DashboardCardTitle>
                       <Users className="h-4 w-4 text-muted-foreground" />
                     </DashboardCardHeader>
                     <DashboardCardContent>
                       <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                       <p className="text-xs text-muted-foreground">
                         +12% from last month
                       </p>
                     </DashboardCardContent>
                   </DashboardCard>
                   
                   <DashboardCard variant="stats">
                     <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <DashboardCardTitle className="text-sm font-medium">Available Dogs</DashboardCardTitle>
                       <Heart className="h-4 w-4 text-muted-foreground" />
                     </DashboardCardHeader>
                     <DashboardCardContent>
                       <div className="text-2xl font-bold">{stats?.totalDogs || 0}</div>
                       <p className="text-xs text-muted-foreground">
                         +3 new this week
                       </p>
                     </DashboardCardContent>
                   </DashboardCard>
                   
                   <DashboardCard variant="stats">
                     <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <DashboardCardTitle className="text-sm font-medium">Pending Adoptions</DashboardCardTitle>
                       <UserCheck className="h-4 w-4 text-muted-foreground" />
                     </DashboardCardHeader>
                     <DashboardCardContent>
                       <div className="text-2xl font-bold">{stats?.pendingAdoptions || 0}</div>
                       <p className="text-xs text-muted-foreground">
                         Awaiting approval
                       </p>
                     </DashboardCardContent>
                   </DashboardCard>
                   
                   <DashboardCard variant="stats">
                     <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <DashboardCardTitle className="text-sm font-medium">Rescue Requests</DashboardCardTitle>
                       <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                     </DashboardCardHeader>
                     <DashboardCardContent>
                       <div className="text-2xl font-bold">{stats?.rescueRequests || 0}</div>
                       <p className="text-xs text-muted-foreground">
                         Requires attention
                       </p>
                     </DashboardCardContent>
                   </DashboardCard>
                 </div>

                         {/* Content Grid */}
             <div className="grid gap-4 md:grid-cols-2">
               {/* Recent Users */}
               <DashboardCard variant="content">
                 <DashboardCardHeader>
                   <DashboardCardTitle>Recent Users</DashboardCardTitle>
                   <DashboardCardDescription>
                     Latest user registrations
                   </DashboardCardDescription>
                 </DashboardCardHeader>
                 <DashboardCardContent>
                   <div className="space-y-4 max-h-64 overflow-y-auto">
                     {Array.isArray(users) && users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <DashboardBadge 
                            variant={user.role === 'admin' ? 'destructive' : 
                                   user.role === 'rescuer' ? 'default' : 'secondary'}
                          >
                            {user.role}
                          </DashboardBadge>
                          <DashboardButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserRoleChange(user.id, 
                              user.role === 'user' ? 'rescuer' : 'user'
                            )}
                          >
                            Toggle Role
                          </DashboardButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCardContent>
              </DashboardCard>

                             {/* Rescue Requests */}
               <DashboardCard variant="content">
                 <DashboardCardHeader>
                   <DashboardCardTitle>Active Rescue Requests</DashboardCardTitle>
                   <DashboardCardDescription>
                     Dogs needing immediate help
                   </DashboardCardDescription>
                 </DashboardCardHeader>
                 <DashboardCardContent>
                   <div className="space-y-4 max-h-64 overflow-y-auto">
                     {Array.isArray(rescueRequests) && rescueRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {request.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {request.reporterName}
                            </p>
                          </div>
                          <DashboardBadge 
                            variant={request.urgency === 'critical' ? 'destructive' : 
                                   request.urgency === 'high' ? 'default' : 'secondary'}
                          >
                            {request.urgency}
                          </DashboardBadge>
                        </div>
                        <p className="text-xs">{request.description}</p>
                        <div className="flex gap-2">
                          <DashboardButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleRescueStatusChange(request.id, 'assigned')}
                          >
                            Assign
                          </DashboardButton>
                          <DashboardButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleRescueStatusChange(request.id, 'completed')}
                          >
                            Complete
                          </DashboardButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCardContent>
              </DashboardCard>
            </div>
              </>
            )}

                         {/* Analytics Section */}
             {activeSection === 'analytics' && (
               <div className="space-y-4">
                 <DashboardCard variant="content">
                   <DashboardCardHeader>
                     <DashboardCardTitle>Analytics Dashboard</DashboardCardTitle>
                     <DashboardCardDescription>
                       System performance and usage statistics
                     </DashboardCardDescription>
                   </DashboardCardHeader>
                   <DashboardCardContent>
                     <div className="max-h-64 overflow-y-auto">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-blue-50 rounded-lg">
                           <h4 className="font-semibold text-blue-900">User Growth</h4>
                           <p className="text-2xl font-bold text-blue-700">+24%</p>
                           <p className="text-sm text-blue-600">This month</p>
                         </div>
                         <div className="p-4 bg-green-50 rounded-lg">
                           <h4 className="font-semibold text-green-900">Adoption Rate</h4>
                           <p className="text-2xl font-bold text-green-700">68%</p>
                           <p className="text-sm text-green-600">Success rate</p>
                         </div>
                       </div>
                     </div>
                   </DashboardCardContent>
                 </DashboardCard>
               </div>
             )}

                         {/* All Users Section */}
             {activeSection === 'all users' && (
               <div className="space-y-4">
                 <DashboardCard variant="content">
                   <DashboardCardHeader>
                     <DashboardCardTitle>All Users</DashboardCardTitle>
                     <DashboardCardDescription>
                       Complete user database with search and filters
                     </DashboardCardDescription>
                   </DashboardCardHeader>
                   <DashboardCardContent>
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                       {Array.isArray(users) && users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <DashboardBadge 
                              variant={user.role === 'admin' ? 'destructive' : 
                                     user.role === 'rescuer' ? 'default' : 'secondary'}
                            >
                              {user.role}
                            </DashboardBadge>
                            <DashboardButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserRoleChange(user.id, 
                                user.role === 'user' ? 'rescuer' : 'user'
                              )}
                            >
                              Toggle Role
                            </DashboardButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DashboardCardContent>
                </DashboardCard>
              </div>
            )}

                         {/* Settings Section */}
             {activeSection === 'settings' && (
               <div className="space-y-4">
                 <DashboardCard variant="content">
                   <DashboardCardHeader>
                     <DashboardCardTitle>System Settings</DashboardCardTitle>
                     <DashboardCardDescription>
                       Configure system preferences and security
                     </DashboardCardDescription>
                   </DashboardCardHeader>
                   <DashboardCardContent>
                     <div className="max-h-64 overflow-y-auto">
                       <div className="space-y-4">
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                           <div>
                             <h4 className="font-medium">Email Notifications</h4>
                             <p className="text-sm text-muted-foreground">Send email alerts for important events</p>
                           </div>
                           <DashboardButton variant="outline" size="sm">Configure</DashboardButton>
                         </div>
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                           <h4 className="font-medium">Backup Schedule</h4>
                           <p className="text-sm text-muted-foreground">Automated daily backups</p>
                           <DashboardButton variant="outline" size="sm">Configure</DashboardButton>
                         </div>
                       </div>
                     </div>
                   </DashboardCardContent>
                 </DashboardCard>
               </div>
             )}

                         {/* Default content for other sections */}
             {!['overview', 'analytics', 'all users', 'settings'].includes(activeSection) && (
               <DashboardCard variant="content">
                 <DashboardCardHeader>
                   <DashboardCardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</DashboardCardTitle>
                   <DashboardCardDescription>
                     This section is under development
                   </DashboardCardDescription>
                 </DashboardCardHeader>
                 <DashboardCardContent>
                   <div className="max-h-64 overflow-y-auto">
                     <p className="text-muted-foreground">
                       The {activeSection} functionality will be implemented soon.
                     </p>
                   </div>
                 </DashboardCardContent>
               </DashboardCard>
             )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
