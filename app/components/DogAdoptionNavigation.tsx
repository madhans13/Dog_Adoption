import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import styles from './ui/Navigation/navigation.module.css';

interface DogAdoptionNavigationProps {
  onAdoptionClick?: () => void;
}

const DogAdoptionNavigation: React.FC<DogAdoptionNavigationProps> = ({ onAdoptionClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdoptionClick = () => {
    if (onAdoptionClick) {
      onAdoptionClick();
    } else {
      navigate('/adoption');
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleRescueClick = () => {
    navigate('/home');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.expandableNav}>
        {/* Home Link */}
        <a 
          onClick={handleHomeClick}
          className={`${styles.navIconLink} ${location.pathname === '/' ? styles.active : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-home"></i>
          <span className={styles.linkText}>Home</span>
        </a>
        
        {/* Browse Dogs Link */}
        <a 
          onClick={handleAdoptionClick}
          className={`${styles.navIconLink} ${location.pathname === '/adoption' ? styles.active : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-heart"></i>
          <span className={styles.linkText}>Browse Dogs</span>
        </a>
        
        {/* Rescue Link */}
        <a 
          onClick={handleRescueClick}
          className={`${styles.navIconLink} ${location.pathname === '/home' ? styles.active : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-first-aid"></i>
          <span className={styles.linkText}>Rescue</span>
        </a>
        
        {/* Special Adoption CTA Button */}
        <a 
          onClick={handleAdoptionClick}
          className={`${styles.navIconLink} ${styles.navCta}`}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-paw"></i>
          <span className={styles.linkText}>Adopt Now</span>
        </a>
      </nav>
    </header>
  );
};

export default DogAdoptionNavigation;

