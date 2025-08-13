import styles from './navigation.module.css'

const Navigation = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.expandableNav}>
        <a href="#home" className={styles.navIconLink}>
          <i className="fas fa-home"></i>
          <span className={styles.linkText}>Home</span>
        </a>
        
      
        
        <a href="#projects" className={styles.navIconLink}>
          <i className="fas fa-folder"></i>
          <span className={styles.linkText}>Projects</span>
        </a>
        
        <a href="#contact" className={styles.navIconLink}>
          <i className="fas fa-phone"></i>
          <span className={styles.linkText}>Contact</span>
        </a>
        
        {/* Social Media Links - At the end */}
        <a 
          href="https://github.com/madhans13" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navIconLink}
        >
          <i className="fab fa-github"></i>
          <span className={styles.linkText}>GitHub</span>
        </a>
        
        <a 
          href="https://twitter.com/heisendev13" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navIconLink}
        >
          <i className="fab fa-twitter"></i>
          <span className={styles.linkText}>Twitter</span>
        </a>
        
        <a 
          href="https://linkedin.com/in/madhan-s-bb0772249" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navIconLink}
        >
          <i className="fab fa-linkedin"></i>
          <span className={styles.linkText}>LinkedIn</span>
        </a>
        
      </nav>
    </header>
  )
}

export default Navigation;