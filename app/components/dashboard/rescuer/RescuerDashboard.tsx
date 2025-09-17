import * as React from "react"
import { useState, useEffect } from "react"
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Camera,
  Heart,
  Activity,
  Users,
  Calendar,
} from "lucide-react"

import { AppSidebar } from "../ui/app-sidebar"
import { getApiBaseUrl } from "../../../lib/utils"
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
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface RescuerDashboardProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

interface RescueRequest {
  id: number
  description: string
  location: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'in_progress' | 'completed'
  reporterName: string
  reporterPhone: string
  imageUrls: string[]
  createdAt: string
  assignedRescuer?: string
}

interface RescuedDog {
  id: number
  name: string
  breed: string
  age: string
  gender: string
  size: string
  color: string
  healthStatus: string
  description: string
  rescueNotes: string
  imageUrl: string
  rescueDate: string
  rescuerId: string
  status: 'rescued' | 'adopted' | 'available_for_adoption'
  rescueRequestId: number
  location: string
}

export default function RescuerDashboard({ isOpen, onClose, user }: RescuerDashboardProps) {
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<RescueRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDogForm, setShowAddDogForm] = useState(false)
  const [activeSection, setActiveSection] = useState('active requests')
  const [showRescueCompletionForm, setShowRescueCompletionForm] = useState(false)
  const [rescuedDogs, setRescuedDogs] = useState<RescuedDog[]>([])
  const [rescueCompletionForm, setRescueCompletionForm] = useState({
    dogName: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    color: '',
    healthStatus: '',
    description: '',
    rescueNotes: '',
    imageFile: null as File | null
  })

  // Add Dog form state
  const [dogForm, setDogForm] = useState({
    name: "",
    age: "",
    breed: "",
    gender: "",
    size: "",
    color: "",
    description: "",
    location: "",
    imageFile: null as File | null,
    isRescueCase: false,
    healthStatus: "",
    vaccinationStatus: "",
    spayedNeutered: false,
    goodWithKids: false,
    goodWithPets: false,
    energyLevel: ""
  })

  // Dashboard configuration for shadcn
  const dashboardData = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : "Rescuer",
      email: user?.email || "rescuer@dogadoption.com",
      avatar: "/avatars/rescuer.jpg",
    },
    teams: [
      {
        name: "🐕 Happy Strays",
        logo: Heart,
        plan: "Rescuer Portal",
      },
    ],
    navMain: [
      {
        title: "Rescue Operations",
        url: "#",
        icon: Activity,
        isActive: true,
        items: [
          {
            title: "Active Requests",
            url: "#",
          },
          {
            title: "My Assignments",
            url: "#",
          },
          {
            title: "Completed Rescues",
            url: "#",
          },
        ],
      },
      {
        title: "Dog Management",
        url: "#",
        icon: Heart,
        items: [
          {
            title: "Add New Dog",
            url: "#",
          },
          {
            title: "My Rescued Dogs",
            url: "#",
          },
          {
            title: "Available Dogs",
            url: "#",
          },
        ],
      },
      {
        title: "Reports",
        url: "#",
        icon: Calendar,
        items: [
          {
            title: "Monthly Report",
            url: "#",
          },
          {
            title: "Success Stories",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Emergency Rescues",
        url: "#",
        icon: AlertTriangle,
      },
      {
        name: "Adoption Center",
        url: "#",
        icon: Users,
      },
      {
        name: "Vet Network",
        url: "#",
        icon: Phone,
      },
    ],
  }

  useEffect(() => {
    if (isOpen) {
      fetchRescueRequests()
      fetchRescuedDogs()
    }
  }, [isOpen])

  useEffect(() => {
    // Ensure rescueRequests is always an array before filtering
    if (!Array.isArray(rescueRequests)) {
      setFilteredRequests([])
      return
    }
    
    const filtered = rescueRequests.filter(request =>
      request.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reporterName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredRequests(filtered)
  }, [rescueRequests, searchQuery])

  const fetchRescueRequests = async () => {
    try {
      setLoading(true)
      const base = getApiBaseUrl()
      const response = await fetch(`${base}/api/rescue`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        
        // Ensure data is always an array and has all required fields
        let requests = []
        if (Array.isArray(data)) {
          requests = data
        } else if (data && Array.isArray(data.requests)) {
          requests = data.requests
        } else if (data && Array.isArray(data.rescueRequests)) {
          requests = data.rescueRequests
        } else {
          console.warn('Unexpected API response format:', data)
          requests = []
        }
        
        // Normalize the data to ensure all fields are present
        const normalizedRequests = requests.map((request: any) => {
          const normalized = {
            id: request.id || request.request_id || request.rescue_id,
            description: request.description || request.notes || '',
            location: request.location || '',
            urgency: request.urgency || request.urgency_level || 'low',
            status: request.status || 'open',
            reporterName: request.reporterName || request.reporter_name || request.name || '',
            reporterPhone: request.contactDetails || '',
            imageUrls: request.imageUrls || request.image_urls || [],
            createdAt: request.createdAt || request.created_at || new Date().toISOString(),
            assignedRescuer: request.assignedRescuer || request.assigned_rescuer_id || null
          }
          
          console.log('Original Request:', request)
          console.log('Normalized Request:', normalized)
          console.log('Phone Field:', normalized.reporterPhone)
          
          return normalized
        })
        
        console.log('All Normalized Requests:', normalizedRequests) // Debug log
        
        // Merge with existing local changes to preserve status updates
        setRescueRequests(prev => {
          const merged = normalizedRequests.map((apiRequest: any) => {
            // Check if we have a local version with status changes
            const localRequest = prev.find(local => local.id === apiRequest.id)
            if (localRequest && localRequest.status !== apiRequest.status) {
              console.log(`Preserving local status change for request ${apiRequest.id}: ${apiRequest.status} -> ${localRequest.status}`)
              return { ...apiRequest, status: localRequest.status, assignedRescuer: localRequest.assignedRescuer }
            }
            return apiRequest
          })
          console.log('Merged rescue requests (preserving local changes):', merged)
          return merged
        })
      } else {
        console.error('Failed to fetch rescue requests:', response.status)
        // Fallback to mock data for development
        setRescueRequests(getMockRescueRequests())
      }
    } catch (error) {
      console.error('Error fetching rescue requests:', error)
      // Fallback to mock data for development
      setRescueRequests(getMockRescueRequests())
    } finally {
      setLoading(false)
    }
  }

  // Mock data for development/testing
  const getMockRescueRequests = (): RescueRequest[] => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    
    return [
      {
        id: 1,
        description: "Dog found injured near downtown area, needs immediate medical attention. The dog appears to have a limp and is hiding under a car. Please respond quickly as this seems urgent.",
        location: "Downtown Area - 123 Main Street",
        urgency: 'critical' as const,
        status: 'open' as const,
        reporterName: "John Smith",
        reporterPhone: "+1-555-0123",
        imageUrls: [],
        createdAt: twoDaysAgo.toISOString(),
        assignedRescuer: 'rescuer1'
      },
      {
        id: 2,
        description: "Stray dog wandering in residential neighborhood, appears friendly and approachable. The dog has a collar but no tags. Seems to be looking for its owner.",
        location: "Residential District - 456 Oak Avenue",
        urgency: 'medium' as const,
        status: 'assigned' as const,
        reporterName: "Sarah Johnson",
        reporterPhone: "+1-555-0456",
        imageUrls: [],
        createdAt: yesterday.toISOString(),
        assignedRescuer: "Rescuer Team A"
      },
      {
        id: 3,
        description: "Dog with collar found in park, seems lost and confused. The dog is friendly and responds to basic commands. Has a blue collar with a small bell.",
        location: "Central Park - Near the fountain",
        urgency: 'low' as const,
        status: 'in_progress' as const,
        reporterName: "Mike Wilson",
        reporterPhone: "+1-555-0789",
        imageUrls: [],
        createdAt: now.toISOString(),
        assignedRescuer: "Rescuer Team B"
      }
    ]
  }

  // Mock data for rescued dogs
  const getMockRescuedDogs = (): RescuedDog[] => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    return [
      {
        id: 1,
        name: "Buddy",
        breed: "Golden Retriever",
        age: "3",
        gender: "Male",
        size: "Large",
        color: "Golden",
        healthStatus: "Healthy",
        description: "Friendly and energetic dog, loves to play fetch",
        rescueNotes: "Found wandering in downtown area, was dehydrated but recovered quickly",
        imageUrl: "",
        rescueDate: yesterday.toISOString(),
        rescuerId: user?.id || "rescuer1",
        status: 'rescued',
        rescueRequestId: 1,
        location: "Downtown Area"
      },
      {
        id: 2,
        name: "Luna",
        breed: "Mixed Breed",
        age: "2",
        gender: "Female",
        size: "Medium",
        color: "Black and White",
        healthStatus: "Needs medication",
        description: "Sweet and gentle, good with children",
        rescueNotes: "Injured leg, receiving treatment and physical therapy",
        imageUrl: "",
        rescueDate: now.toISOString(),
        rescuerId: user?.id || "rescuer1",
        status: 'rescued',
        rescueRequestId: 2,
        location: "Residential District"
      }
    ]
  }

  const fetchRescuedDogs = async () => {
    try {
      const base2 = getApiBaseUrl()
      const response = await fetch(`${base2}/api/rescued-dogs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Rescued dogs API response:', data)
      
      if (data.success && Array.isArray(data.rescuedDogs)) {
        setRescuedDogs(data.rescuedDogs)
      } else {
        console.warn('Unexpected rescued dogs API response format:', data)
        setRescuedDogs([])
      }
    } catch (error) {
      console.error('Error fetching rescued dogs:', error)
      setRescuedDogs([])
    }
  }

  const handleStartRescue = async (requestId: number) => {
    try {
      const base3 = getApiBaseUrl()
      const response = await fetch(`${base3}/api/rescue/${requestId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress',
          assignedRescuerId: user?.id,
          assignedAt: new Date().toISOString()
        })
      })
      if (response.ok) {
        console.log('Rescue started successfully by user:', user?.id)
        fetchRescueRequests()
      } else {
        console.error('Failed to start rescue:', response.status)
        // Fallback: Update local state for development
        setRescueRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'in_progress', assignedRescuer: user?.id || 'Current User' }
            : req
        ))
      }
    } catch (error) {
      console.error('Error starting rescue:', error)
      // Fallback: Update local state for development
      setRescueRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'in_progress', assignedRescuer: user?.id || 'Current User' }
          : req
      ))
    }
  }

  const handleCompleteRescue = async (requestId: number) => {
    try {
      console.log('Opening rescue completion form for request:', requestId, 'by user:', user?.id)
      
      // Don't change status yet - just show the completion form
      // The status will only change to 'completed' after the user submits the form
      setShowRescueCompletionForm(true)
      
    } catch (error) {
      console.error('Error opening rescue completion form:', error)
      alert('Error opening completion form. Please try again.')
    }
  }

  const handleRescueCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Rescue completion form submitted:', rescueCompletionForm)
    console.log('Selected request:', selectedRequest)
    
    if (!rescueCompletionForm.dogName || !rescueCompletionForm.breed || !rescueCompletionForm.imageFile) {
      alert('Please fill in all required fields (Dog Name, Breed, and Dog Photo)')
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', rescueCompletionForm.dogName)
      formData.append('breed', rescueCompletionForm.breed)
      formData.append('age', rescueCompletionForm.age ? rescueCompletionForm.age : '')
      formData.append('gender', rescueCompletionForm.gender)
      formData.append('size', rescueCompletionForm.size)
      formData.append('color', rescueCompletionForm.color)
      formData.append('location', selectedRequest?.location || 'Rescued')
      formData.append('description', rescueCompletionForm.description)
      if (rescueCompletionForm.imageFile) {
        formData.append('image', rescueCompletionForm.imageFile)
      }
      formData.append('rescuerId', user?.id || '')
      formData.append('rescueDate', new Date().toISOString())
      formData.append('rescueNotes', rescueCompletionForm.rescueNotes)
      formData.append('rescueRequestId', selectedRequest?.id?.toString() || '')
      formData.append('status', 'rescued')

      // Add the rescued dog to the rescued dogs table
      const base4 = getApiBaseUrl()
      const response = await fetch(`${base4}/api/rescued-dogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Rescued dog added successfully:', result)
      
      // Now update the rescue request status to completed
      if (selectedRequest) {
        console.log('Updating rescue request status to completed for ID:', selectedRequest.id)
        
        // Update the rescue requests list
        setRescueRequests(prev => {
          const updated = prev.map(req => 
            req.id === selectedRequest.id 
              ? { ...req, status: 'completed' as const, assignedRescuer: user?.id || 'Current User' }
              : req
          )
          console.log('Updated rescue requests:', updated)
          return updated
        })
        
        // Also update the selectedRequest state so the modal shows the updated status
        setSelectedRequest(prev => {
          if (prev) {
            const updated = { ...prev, status: 'completed' as const, assignedRescuer: user?.id || 'Current User' }
            console.log('Updated selectedRequest:', updated)
            return updated
          }
          return prev
        })
      }
      
      // Reset form and close modal
      setRescueCompletionForm({
        dogName: '',
        breed: '',
        age: '',
        gender: '',
        size: '',
        color: '',
        healthStatus: '',
        description: '',
        rescueNotes: '',
        imageFile: null
      })
      setShowRescueCompletionForm(false)
      
      // Don't close the selectedRequest immediately - let user see the status change
      // Close it after a short delay so the status update is visible
      setTimeout(() => {
        setSelectedRequest(null)
      }, 2000)
      
      // Refresh the rescued dogs list to show the new addition
      fetchRescuedDogs()
      
      alert('Rescue completed successfully! The dog has been added to the rescued dogs list.')
    } catch (error) {
      console.error('Error completing rescue:', error)
      alert('Error completing rescue. Please try again.')
    }
  }

  const moveToAdoption = async (rescuedDog: RescuedDog) => {
    try {
      // Create FormData for the main dogs table
      const formData = new FormData()
      formData.append('name', rescuedDog.name)
      formData.append('age', rescuedDog.age)
      formData.append('breed', rescuedDog.breed)
      formData.append('gender', rescuedDog.gender)
      formData.append('size', rescuedDog.size)
      formData.append('color', rescuedDog.color)
      formData.append('location', rescuedDog.location)
      formData.append('description', rescuedDog.description)
      formData.append('isRescueCase', 'true')
      formData.append('healthStatus', rescuedDog.healthStatus)
      formData.append('status', 'available')
      formData.append('rescuerId', rescuedDog.rescuerId)
      formData.append('rescueDate', rescuedDog.rescueDate)
      formData.append('rescueNotes', rescuedDog.rescueNotes)
      
      // If there's an image URL, convert it to a file or keep as URL
      if (rescuedDog.imageUrl) {
        formData.append('imageUrl', rescuedDog.imageUrl)
      }

      const base5 = getApiBaseUrl()
      const response = await fetch(`${base5}/api/dogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Dog moved to adoption table successfully:', result)
        
        // Update the rescued dog status to 'available_for_adoption'
        setRescuedDogs(prev => prev.map(dog => 
          dog.id === rescuedDog.id 
            ? { ...dog, status: 'available_for_adoption' as const }
            : dog
        ))
        
        alert('Dog successfully moved to adoption table!')
      } else {
        const errorData = await response.json()
        alert(`Error moving dog to adoption: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error moving dog to adoption:', error)
      alert('Error moving dog to adoption. Please try again.')
    }
  }

  const handleAddDog = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!dogForm.name || !dogForm.age || !dogForm.breed || !dogForm.gender || 
        !dogForm.size || !dogForm.location || !dogForm.description || !dogForm.imageFile) {
      alert('Please fill in all required fields marked with *')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', dogForm.name)
      formData.append('age', dogForm.age)
      formData.append('breed', dogForm.breed)
      formData.append('gender', dogForm.gender)
      formData.append('size', dogForm.size)
      formData.append('color', dogForm.color)
      formData.append('location', dogForm.location)
      formData.append('description', dogForm.description)
      if (dogForm.imageFile) {
        formData.append('image', dogForm.imageFile)
      }
      formData.append('isRescueCase', dogForm.isRescueCase.toString())
      formData.append('healthStatus', dogForm.healthStatus)
      formData.append('vaccinationStatus', dogForm.vaccinationStatus)
      formData.append('spayedNeutered', dogForm.spayedNeutered.toString())
      formData.append('goodWithKids', dogForm.goodWithKids.toString())
      formData.append('goodWithPets', dogForm.goodWithPets.toString())
      formData.append('energyLevel', dogForm.energyLevel)

      const base6 = getApiBaseUrl()
      const response = await fetch(`${base6}/api/dogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Dog added successfully:', result)
        
        // Reset form
        setDogForm({
          name: "",
          age: "",
          breed: "",
          gender: "",
          size: "",
          color: "",
          description: "",
          location: "",
          imageFile: null,
          isRescueCase: false,
          healthStatus: "",
          vaccinationStatus: "",
          spayedNeutered: false,
          goodWithKids: false,
          goodWithPets: false,
          energyLevel: ""
        })
        
        alert('Dog added successfully! The dog is now available for adoption.')
      } else {
        const errorData = await response.json()
        alert(`Error adding dog: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding dog:', error)
      alert('Error adding dog. Please try again.')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-yellow-100 text-yellow-800'
      case 'open': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                      Rescuer Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Active Rescues</BreadcrumbPage>
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
              {['active requests', 'my assignments', 'completed rescues', 'add new dog', 'my rescued dogs', 'available dogs', 'monthly report', 'success stories'].map((section) => (
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
            {activeSection === 'active requests' && (
              <>
                {/* Quick Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                  <DashboardCard variant="stats">
                    <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <DashboardCardTitle className="text-sm font-medium">Open Requests</DashboardCardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="text-2xl font-bold">
                        {Array.isArray(rescueRequests) ? rescueRequests.filter(r => r.status === 'open').length : 0}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                  
                  <DashboardCard variant="stats">
                    <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <DashboardCardTitle className="text-sm font-medium">In Progress</DashboardCardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="text-2xl font-bold">
                        {Array.isArray(rescueRequests) ? rescueRequests.filter(r => r.status === 'in_progress').length : 0}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                  
                  <DashboardCard variant="stats">
                    <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <DashboardCardTitle className="text-sm font-medium">Completed</DashboardCardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="text-2xl font-bold">
                        {Array.isArray(rescueRequests) ? rescueRequests.filter(r => r.status === 'completed').length : 0}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                  
                  <DashboardCard variant="stats">
                    <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <DashboardCardTitle className="text-sm font-medium">Critical Cases</DashboardCardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="text-2xl font-bold">
                        {Array.isArray(rescueRequests) ? rescueRequests.filter(r => r.urgency === 'critical').length : 0}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search rescue requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading...
                    </div>
                  )}
                </div>

                {/* Rescue Requests */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {Array.isArray(filteredRequests) && filteredRequests.map((request) => (
                      <DashboardCard key={request.id} variant="content" className="cursor-pointer">
                        <DashboardCardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <DashboardCardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {request.location}
                              </DashboardCardTitle>
                              <DashboardCardDescription>
                                Reported by {request.reporterName}
                              </DashboardCardDescription>
                            </div>
                            <div className="flex gap-1">
                              <DashboardBadge variant={getUrgencyColor(request.urgency)}>
                                {request.urgency}
                              </DashboardBadge>
                              <DashboardBadge className={getStatusColor(request.status)}>
                                {request.status}
                              </DashboardBadge>
                            </div>
                          </div>
                        </DashboardCardHeader>
                        <DashboardCardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {request.description}
                          </p>
                          
                          {request.imageUrls && request.imageUrls.length > 0 && (
                            <div className="flex gap-2 mb-4">
                              {request.imageUrls.slice(0, 3).map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Rescue image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              ))}
                              {request.imageUrls.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs">
                                  +{request.imageUrls.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {request.status === 'open' && (
                              <DashboardButton
                                size="sm"
                                onClick={() => handleStartRescue(request.id)}
                              >
                                Start Rescue
                              </DashboardButton>
                            )}
                            {request.status === 'in_progress' && (
                              <DashboardButton
                                size="sm"
                                onClick={() => handleCompleteRescue(request.id)}
                              >
                                Mark Complete
                              </DashboardButton>
                            )}
                            <DashboardButton
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              View Details
                            </DashboardButton>
                          </div>
                        </DashboardCardContent>
                      </DashboardCard>
                    ))}
                  </div>
                </div>

                {Array.isArray(filteredRequests) && filteredRequests.length === 0 && !loading && (
                  <DashboardCard variant="content">
                    <DashboardCardContent className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No rescue requests found</h3>
                      <p className="text-muted-foreground">
                        All caught up! Check back later for new rescue requests.
                      </p>
                    </DashboardCardContent>
                  </DashboardCard>
                )}
              </>
            )}

            {/* Add New Dog Section */}
            {activeSection === 'add new dog' && (
              <div className="space-y-4">
                <DashboardCard variant="content">
                  <DashboardCardHeader>
                    <DashboardCardTitle>Add New Dog</DashboardCardTitle>
                    <DashboardCardDescription>
                      Add a new dog to the adoption system. All fields marked with * are required.
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <form onSubmit={handleAddDog} className="grid grid-cols-2 gap-4">
                        {/* Basic Information */}
                        <div className="space-y-2">
                          <Label htmlFor="name">Dog Name *</Label>
                          <Input
                            id="name"
                            value={dogForm.name}
                            onChange={(e) => setDogForm({...dogForm, name: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="age">Age (years) *</Label>
                          <Input
                            id="age"
                            type="number"
                            min="0"
                            max="25"
                            value={dogForm.age}
                            onChange={(e) => setDogForm({...dogForm, age: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="breed">Breed *</Label>
                          <Input
                            id="breed"
                            value={dogForm.breed}
                            onChange={(e) => setDogForm({...dogForm, breed: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender *</Label>
                          <Select 
                            value={dogForm.gender} 
                            onValueChange={(value) => setDogForm({...dogForm, gender: value})}
                          >
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
                          <Label htmlFor="size">Size *</Label>
                          <Select 
                            value={dogForm.size} 
                            onValueChange={(value) => setDogForm({...dogForm, size: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Small">Small</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Large">Large</SelectItem>
                              <SelectItem value="Extra Large">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={dogForm.color}
                            onChange={(e) => setDogForm({...dogForm, color: e.target.value})}
                            placeholder="e.g., Brown, Black, White"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={dogForm.location}
                            onChange={(e) => setDogForm({...dogForm, location: e.target.value})}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="energyLevel">Energy Level</Label>
                          <Select 
                            value={dogForm.energyLevel} 
                            onValueChange={(value) => setDogForm({...dogForm, energyLevel: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select energy level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="imageFile">Dog Photo *</Label>
                          <Input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setDogForm({...dogForm, imageFile: file})
                              }
                            }}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Please upload a photo of the dog. This field is mandatory.
                          </p>
                        </div>
                        
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={dogForm.description}
                            onChange={(e) => setDogForm({...dogForm, description: e.target.value})}
                            placeholder="Describe the dog's personality, behavior, and any special needs..."
                            required
                          />
                        </div>

                        {/* Health & Behavior */}
                        <div className="space-y-2">
                          <Label htmlFor="healthStatus">Health Status</Label>
                          <Input
                            id="healthStatus"
                            value={dogForm.healthStatus}
                            onChange={(e) => setDogForm({...dogForm, healthStatus: e.target.value})}
                            placeholder="e.g., Healthy, Needs medication"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vaccinationStatus">Vaccination Status</Label>
                          <Input
                            id="vaccinationStatus"
                            value={dogForm.vaccinationStatus}
                            onChange={(e) => setDogForm({...dogForm, vaccinationStatus: e.target.value})}
                            placeholder="e.g., Up to date, Needs boosters"
                          />
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-4 col-span-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="spayedNeutered"
                              checked={dogForm.spayedNeutered}
                              onChange={(e) => setDogForm({...dogForm, spayedNeutered: e.target.checked})}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="spayedNeutered">Spayed/Neutered</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="goodWithKids"
                              checked={dogForm.goodWithKids}
                              onChange={(e) => setDogForm({...dogForm, goodWithKids: e.target.checked})}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="goodWithKids">Good with Kids</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="goodWithPets"
                              checked={dogForm.goodWithPets}
                              onChange={(e) => setDogForm({...dogForm, goodWithPets: e.target.checked})}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="goodWithPets">Good with Other Pets</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isRescueCase"
                              checked={dogForm.isRescueCase}
                              onChange={(e) => setDogForm({...dogForm, isRescueCase: e.target.checked})}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isRescueCase">This is a Rescue Case</Label>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex gap-2">
                          <DashboardButton type="submit">Add Dog</DashboardButton>
                          <DashboardButton type="button" variant="outline" onClick={() => setShowAddDogForm(false)}>
                            Cancel
                          </DashboardButton>
                        </div>
                      </form>
                    </div>
                  </DashboardCardContent>
                </DashboardCard>
              </div>
            )}

            {/* Monthly Report Section */}
            {activeSection === 'monthly report' && (
              <div className="space-y-4">
                <DashboardCard variant="content">
                  <DashboardCardHeader>
                    <DashboardCardTitle>Monthly Rescue Report</DashboardCardTitle>
                    <DashboardCardDescription>
                      Summary of rescue activities for this month
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900">Total Rescues</h4>
                          <p className="text-2xl font-bold text-blue-700">12</p>
                          <p className="text-sm text-blue-600">This month</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900">Success Rate</h4>
                          <p className="text-2xl font-bold text-green-700">92%</p>
                          <p className="text-sm text-green-600">Successful rescues</p>
                        </div>
                      </div>
                    </div>
                  </DashboardCardContent>
                </DashboardCard>
              </div>
            )}

            {/* My Rescued Dogs Section */}
            {activeSection === 'my rescued dogs' && (
              <div className="space-y-4">
                <DashboardCard variant="content">
                  <DashboardCardHeader>
                    <DashboardCardTitle>My Rescued Dogs</DashboardCardTitle>
                    <DashboardCardDescription>
                      View all dogs you have successfully rescued. You can move them to the adoption table when they're ready.
                    </DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    <div className="max-h-96 overflow-y-auto">
                      {rescuedDogs.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {rescuedDogs.map((dog) => (
                            <DashboardCard key={dog.id} variant="content" className="relative">
                              <DashboardCardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <DashboardCardTitle className="text-base">{dog.name}</DashboardCardTitle>
                                    <DashboardCardDescription>{dog.breed}</DashboardCardDescription>
                                  </div>
                                  <DashboardBadge 
                                    variant={dog.status === 'rescued' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {dog.status.replace('_', ' ')}
                                  </DashboardBadge>
                                </div>
                              </DashboardCardHeader>
                              <DashboardCardContent>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Age:</span>
                                    <span>{dog.age} years</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gender:</span>
                                    <span>{dog.gender}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Size:</span>
                                    <span>{dog.size}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Health:</span>
                                    <span>{dog.healthStatus || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rescued:</span>
                                    <span>{new Date(dog.rescueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {dog.description}
                                  </p>
                                  {dog.rescueNotes && (
                                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                      <strong>Rescue Notes:</strong> {dog.rescueNotes}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="mt-4 flex gap-2">
                                  {dog.status === 'rescued' && (
                                    <DashboardButton
                                      size="sm"
                                      onClick={() => moveToAdoption(dog)}
                                      className="flex-1"
                                    >
                                      Move to Adoption
                                    </DashboardButton>
                                  )}
                                  {dog.status === 'available_for_adoption' && (
                                    <DashboardBadge variant="secondary" className="w-full text-center">
                                      Ready for Adoption
                                    </DashboardBadge>
                                  )}
                                </div>
                              </DashboardCardContent>
                            </DashboardCard>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No rescued dogs yet</h3>
                          <p className="text-muted-foreground">
                            Complete rescue operations to see rescued dogs here.
                          </p>
                        </div>
                      )}
                    </div>
                  </DashboardCardContent>
                </DashboardCard>
              </div>
            )}

            {/* Default content for other sections */}
            {!['active requests', 'add new dog', 'monthly report', 'my rescued dogs'].includes(activeSection) && (
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

            {/* View Details Modal */}
            {selectedRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[85vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Rescue Request Details</h2>
                      <button
                        onClick={() => setSelectedRequest(null)}
                        className="text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Main Information */}
                      <div className="space-y-4">
                        {/* Status and Urgency */}
                        <div className="flex gap-2">
                          <DashboardBadge variant={getUrgencyColor(selectedRequest.urgency || 'low')}>
                            {(selectedRequest.urgency || 'low').toUpperCase()}
                          </DashboardBadge>
                          <DashboardBadge className={getStatusColor(selectedRequest.status || 'open')}>
                            {(selectedRequest.status || 'open').replace('_', ' ').toUpperCase()}
                          </DashboardBadge>
                        </div>

                        {/* Location */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                          <p className="text-gray-700 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            {selectedRequest.location || 'Location not specified'}
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-700 leading-relaxed">{selectedRequest.description || 'No description provided'}</p>
                        </div>

                        {/* Images */}
                        {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Photos ({selectedRequest.imageUrls.length})</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedRequest.imageUrls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Rescue image ${index + 1}`}
                                  className="w-full h-28 object-cover rounded border"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Reporter Information and Actions */}
                      <div className="space-y-4">
                        {/* Reporter Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporter Information</h3>
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Name:</span>
                              <span className="text-gray-900">{selectedRequest.reporterName || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Phone:</span>
                              <span className="text-gray-900">{selectedRequest.reporterPhone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Reported:</span>
                              <span className="text-gray-900">
                                {selectedRequest.createdAt ? 
                                  new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Date not available'
                                }
                              </span>
                            </div>
                            {selectedRequest.assignedRescuer && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Assigned To:</span>
                                <span className="text-gray-900">{selectedRequest.assignedRescuer}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        

                        {/* Additional Details */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
                          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Request ID:</span>
                              <span className="text-gray-900 font-mono">#{selectedRequest.id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Priority:</span>
                              <span className="text-gray-900 capitalize">{selectedRequest.urgency || 'low'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Current Status:</span>
                              <span className="text-gray-900 capitalize">{(selectedRequest.status || 'open').replace('_', ' ')}</span>
                            </div>

                          </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="pt-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                          <div className="space-y-3">
                            {selectedRequest.status === 'open' && selectedRequest.id && (
                              <DashboardButton
                                onClick={() => {
                                  handleStartRescue(selectedRequest.id);
                                  setSelectedRequest(null);
                                }}
                                className="w-full"
                              >
                                Start Rescue
                            </DashboardButton>
                            )}
                            {selectedRequest.status === 'in_progress' && selectedRequest.id && (
                              <DashboardButton
                                onClick={() => handleCompleteRescue(selectedRequest.id)}
                                className="w-full"
                              >
                                Mark Complete
                              </DashboardButton>
                            )}
                            <DashboardButton
                              variant="outline"
                              onClick={() => setSelectedRequest(null)}
                              className="w-full"
                            >
                              Close
                            </DashboardButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rescue Completion Form Modal */}
            {showRescueCompletionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Complete Rescue - Add Dog Details</h2>
                      <button
                        onClick={() => setShowRescueCompletionForm(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleRescueCompletionSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="dogName">Dog Name *</Label>
                            <Input
                              id="dogName"
                              value={rescueCompletionForm.dogName}
                              onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, dogName: e.target.value})}
                              required
                              placeholder="Enter the dog's name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="breed">Breed *</Label>
                            <Input
                              id="breed"
                              value={rescueCompletionForm.breed}
                              onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, breed: e.target.value})}
                              required
                              placeholder="e.g., Golden Retriever, Mixed"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="age">Age (years)</Label>
                            <Input
                              id="age"
                              type="number"
                              min="0"
                              max="25"
                              value={rescueCompletionForm.age}
                              onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, age: e.target.value})}
                              placeholder="Estimated age"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select 
                              value={rescueCompletionForm.gender} 
                              onValueChange={(value) => setRescueCompletionForm({...rescueCompletionForm, gender: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Physical Characteristics */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Physical Characteristics</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Select 
                              value={rescueCompletionForm.size} 
                              onValueChange={(value) => setRescueCompletionForm({...rescueCompletionForm, size: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Small">Small</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Large">Large</SelectItem>
                                <SelectItem value="Extra Large">Extra Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input
                              id="color"
                              value={rescueCompletionForm.color}
                              onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, color: e.target.value})}
                              placeholder="e.g., Brown, Black, White"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="healthStatus">Health Status</Label>
                            <Input
                              id="healthStatus"
                              value={rescueCompletionForm.healthStatus}
                              onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, healthStatus: e.target.value})}
                              placeholder="e.g., Healthy, Needs medication, Recovering"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="imageFile">Dog Photo *</Label>
                            <Input
                              id="imageFile"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setRescueCompletionForm({...rescueCompletionForm, imageFile: file})
                                }
                              }}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description and Notes */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Description & Notes</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Dog Description</Label>
                          <Textarea
                            id="description"
                            value={rescueCompletionForm.description}
                            onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, description: e.target.value})}
                            placeholder="Describe the dog's personality, behavior, and any special characteristics..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rescueNotes">Rescue Notes</Label>
                          <Textarea
                            id="rescueNotes"
                            value={rescueCompletionForm.rescueNotes}
                            onChange={(e) => setRescueCompletionForm({...rescueCompletionForm, rescueNotes: e.target.value})}
                            placeholder="Add any notes about the rescue operation, conditions found, or special care needed..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <DashboardButton type="submit" className="flex-1">
                          Complete Rescue & Add Dog
                        </DashboardButton>
                        <DashboardButton 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowRescueCompletionForm(false)
                            // Reset form when canceling
                            setRescueCompletionForm({
                              dogName: '',
                              breed: '',
                              age: '',
                              gender: '',
                              size: '',
                              color: '',
                              healthStatus: '',
                              description: '',
                              rescueNotes: '',
                              imageFile: null
                            })
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </DashboardButton>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
