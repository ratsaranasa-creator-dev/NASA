import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, FileText, ClipboardList, Briefcase, Newspaper, Theater, Heart, Mail, LogOut, Settings } from 'lucide-react';
import logo from '../images/LOGO.jpg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const toggleAdminSidebar = () => {
    document.dispatchEvent(new Event('toggleAdminSidebar'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-custom">
      <div className="nav-wrapper">
        <div className="nav-brand-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAdminRoute && (
            <button className="admin-sidebar-toggle-navbar" onClick={toggleAdminSidebar} aria-label="Toggle Admin Sidebar">
              <Menu size={28} />
            </button>
          )}
          <Link to="/" className="nav-center" onClick={closeMobileMenu} style={{ padding: 0 }}>
            <div className="logo-container">
              <img src={logo} alt="Logo Dembéni" className="nav-logo" />
              <span className="brand-name">DEMBENI</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="nav-desktop">
          <div className="nav-left">
            <Link to="/" className="nav-link" title="Accueil">
              <Home size={18} /> <span>Accueil</span>
            </Link>
            <Link to="/demarches" className="nav-link" title="Démarches">
              <FileText size={18} /> <span>Démarches</span>
            </Link>
            <Link to="/projet" className="nav-link" title="Projet">
              <ClipboardList size={18} /> <span>Projet</span>
            </Link>
            <Link to="/services" className="nav-link" title="Services publics">
              <Briefcase size={18} /> <span>Services</span>
            </Link>
          </div>

          <div className="nav-right">
            <Link to="/actualites" className="nav-link" title="Actualités">
              <Newspaper size={18} /> <span>Actualités</span>
            </Link>
            <Link to="/culture" className="nav-link" title="Culture">
              <Theater size={18} /> <span>Culture</span>
            </Link>
            <Link to="/solidarite" className="nav-link" title="Solidarité et Santé">
              <Heart size={18} /> <span>Santé</span>
            </Link>
            <Link to="/contact" className="nav-link" title="Contact">
              <Mail size={18} /> <span>Contact</span>
            </Link>
            
            <div className="nav-divider"></div>
            
            {!user ? (
              <Link to="/signup" className="btn-signup-nav">S'inscrire</Link>
            ) : (
              <button onClick={handleLogout} className="btn-logout-nav">
                <LogOut size={18} /> <span>Quitter</span>
              </button>
            )}
            
            <Link to="/admin" className="nav-link admin-link" title="Admin">
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`nav-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="nav-logo" />
            <span className="brand-name">DEMBENI</span>
          </div>
          <button className="btn-close-drawer" onClick={closeMobileMenu}><X size={24} /></button>
        </div>
        
        <div className="mobile-drawer-content">
          <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Home size={20} /> Accueil
          </Link>
          <Link to="/demarches" className="mobile-nav-link" onClick={closeMobileMenu}>
            <FileText size={20} /> Démarches
          </Link>
          <Link to="/projet" className="mobile-nav-link" onClick={closeMobileMenu}>
            <ClipboardList size={20} /> Projets Municipaux
          </Link>
          <Link to="/services" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Briefcase size={20} /> Services Publics
          </Link>
          <Link to="/actualites" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Newspaper size={20} /> Actualités
          </Link>
          <Link to="/culture" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Theater size={20} /> Culture & Loisirs
          </Link>
          <Link to="/solidarite" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Heart size={20} /> Santé & Solidarité
          </Link>
          <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Mail size={20} /> Contact
          </Link>
          
          <div className="mobile-drawer-divider"></div>
          
          {!user ? (
            <Link to="/signup" className="mobile-btn-signup" onClick={closeMobileMenu}>Créer un compte</Link>
          ) : (
            <>
              <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
                <Settings size={20} /> Administration
              </Link>
              <button onClick={handleLogout} className="mobile-btn-logout">
                <LogOut size={20} /> Se déconnecter
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`nav-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={closeMobileMenu}></div>
    </nav>
  );
};

export default Navbar;
