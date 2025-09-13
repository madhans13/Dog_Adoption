import type { Route } from "./+types/_index";
import LandingPage from "../components/LandingPage";
import { useNavigate, Meta } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dog Adoption - Find Your Perfect Companion" },
    { name: "description", content: "Every dog deserves a loving home. Discover your perfect companion and give them the life they deserve." },
  ];
}

export default function Index() {
  const navigate = useNavigate();

  // Preload the adoption route for faster navigation
  useEffect(() => {
    // Prefetch the adoption route after a short delay
    const timer = setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/adoption';
      document.head.appendChild(link);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Add a slight transition effect before navigation
    document.body.style.opacity = '0.95';
    
    setTimeout(() => {
      navigate('/adoption');
      document.body.style.opacity = '1';
    }, 100);
  };

  const handleLearnMore = () => {
    // Scroll to features section or show more info
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // This is the FIRST page everyone sees - the landing page
  return (
    <>
      <Meta />
      <LandingPage 
        onGetStarted={handleGetStarted}
        onLearnMore={handleLearnMore}
      />
    </>
  );
}