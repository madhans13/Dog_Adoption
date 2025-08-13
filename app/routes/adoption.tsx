import type { Route } from "./+types/adoption";
import { useState, useEffect } from "react";
import UserHomepage from "../components/UserHomepage";

// Preload critical resources
if (typeof window !== 'undefined') {
  // Preload common dog images
  const imagePreloader = new Image();
  imagePreloader.src = '/placeholder-dog.jpg';
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
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle authentication success
  const handleAuthSuccess = (userData: any, userToken: string) => {
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

  // Show the UserHomepage for adoption functionality
  return (
    <UserHomepage 
      user={user}
      onLogout={handleLogout}
      onLogin={handleAuthSuccess}
    />
  );
}