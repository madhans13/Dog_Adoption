import type { Route } from "./+types/adoption";
import { useState, useEffect } from "react";
import UserHomepage from "../components/UserHomepage";
import RescuerDashboard from "../components/RescuerDashboard";
import AdminDashboardNew from "../components/AdminDashboardNew";

// Preload critical resources
if (typeof window !== 'undefined') {
  // Skip image preloading to avoid route conflicts for now
  // const imagePreloader = new Image();
  // imagePreloader.src = '/placeholder-dog.jpg';
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dog Adoption - Browse Available Dogs" },
    { name: "description", content: "Browse our available dogs for adoption. Find your perfect furry companion!" },
  ];
}

export default function Adoption() {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  // Check for existing authentication on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Loading from localStorage in adoption route - Token:', savedToken);
    console.log('Loading from localStorage in adoption route - User:', savedUser);
    
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('Parsed user from localStorage in adoption route:', parsedUser);
      console.log('Parsed user role from localStorage in adoption route:', parsedUser.role);
      
      setToken(savedToken);
      setUser(parsedUser);
    }
  }, []);

  // Monitor user changes for debugging
  useEffect(() => {
    console.log('User state changed in adoption route:', user);
    console.log('User role changed in adoption route to:', user?.role);
  }, [user]);

  // Handle authentication success
  const handleAuthSuccess = (userData: any, userToken: string) => {
    console.log('Auth success in adoption route - User data:', userData);
    console.log('Auth success in adoption route - User role:', userData.role);
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

  // Role-based routing logic
  console.log('Adoption route - Current user:', user);
  console.log('Adoption route - User role:', user?.role);

  // If user is admin, show admin dashboard
  if (user && (user.role === 'admin' || user.role === 'Admin' || user.role === 1)) {
    console.log('Routing to Admin Dashboard from adoption route');
    return (
      <AdminDashboardNew
        isOpen={true}
        onClose={() => {
          // Admin logout instead of just closing dashboard
          handleLogout();
        }}
        userToken={token}
      />
    );
  }

  // If user is rescuer, show rescuer dashboard
  if (user && (user.role === 'rescuer' || user.role === 'Rescuer' || user.role === 2)) {
    console.log('Routing to Rescuer Dashboard from adoption route');
    return (
      <RescuerDashboard
        isOpen={true}
        onClose={() => {
          // Rescuer logout instead of just closing dashboard
          handleLogout();
        }}
        user={user}
      />
    );
  }

  // For regular users (including guests), show the UserHomepage
  console.log('Routing to User Homepage from adoption route');
  return (
    <UserHomepage 
      user={user}
      onLogout={handleLogout}
      onLogin={handleAuthSuccess}
    />
  );
}