import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, FileText, Palmtree, GraduationCap, ArrowRight, Activity, Building, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResponsiveImage from '../components/Common/ResponsiveImage';

// Imports des images locales
import bg1 from '../images/01.jpg';
import bg2 from '../images/05.jpg';
import bg3 from '../images/08.jpg';
import bg4 from '../images/13.jpg';
import news1 from '../images/001.jpg';
import news2 from '../images/002.jpg';
import heritageImg from '../images/05.jpg';
import cultureImg from '../images/08.jpg';
import servicesImg from '../images/13.jpg';

import '../styles/HomePremium.css'; // Nouveau CSS Premium

const backgroundImages = [bg1, bg2, bg3, bg4];

const Home = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="home-premium-page">
      
      {/* --- HERO SECTION PREMIUM --- */}
      <header className="hero-premium">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="hero-premium-bg"
            style={{ backgroundImage: `url(${backgroundImages[currentBg]})` }}
          />
        </AnimatePresence>
        <div className="hero-premium-overlay"></div>
        
        <motion.div 
          className="hero-premium-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.div variants={fadeUp} className="official-badge-premium">
            <span className="dot">●</span> SITE OFFICIEL — COMMUNE DE DEMBÉNI
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="hero-premium-title">
            Bienvenue sur le portail numérique de <span style={{ color: '#10b981' }}>Dembéni</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="hero-premium-desc">
            Une plateforme innovante pour renforcer la proximité, faciliter vos démarches administratives au quotidien et vous informer sur la vie de notre belle commune.
          </motion.p>
          
          <motion.div variants={fadeUp} className="hero-premium-actions">
            <Link to="/demarches" className="btn-premium-primary">
              Mes démarches en ligne <ArrowRight size={20} />
            </Link>
            <Link to="/actualites" className="btn-premium-white">
              Actualités de la ville
            </Link>
          </motion.div>
        </motion.div>
      </header>

      {/* --- CHIFFRES CLÉS --- */}
      <section className="stats-section">
        <div className="stats-grid">
          <motion.div className="stat-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
            <div className="stat-icon"><Users size={28} /></div>
            <div className="stat-number">15 000+</div>
            <div className="stat-label">Habitants</div>
          </motion.div>
          <motion.div className="stat-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}}>
            <div className="stat-icon"><Building size={28} /></div>
            <div className="stat-number">5</div>
            <div className="stat-label">Villages</div>
          </motion.div>
          <motion.div className="stat-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.2}}>
            <div className="stat-icon"><GraduationCap size={28} /></div>
            <div className="stat-number">12</div>
            <div className="stat-label">Établissements scolaires</div>
          </motion.div>
          <motion.div className="stat-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.3}}>
            <div className="stat-icon"><Activity size={28} /></div>
            <div className="stat-number">100%</div>
            <div className="stat-label">Démarches numérisées</div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID LAYOUT --- */}
      <section className="premium-section">
        <div className="premium-container">
          
          <div className="section-header-premium">
            <h2>Dembéni, une ville dynamique</h2>
            <p>Découvrez les projets, l'histoire et l'engagement de notre commune pour le bien-être de ses citoyens.</p>
          </div>

          <div className="bento-grid">
            
            {/* Mot du Maire (Large) */}
            <motion.div className="bento-item bento-large" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp}>
              <div className="mayor-word">
                <ResponsiveImage src={news1} alt="Maire de Dembéni" className="mayor-image" />
                <div className="mayor-content">
                  <h3>Le mot du Maire</h3>
                  <p>"Chères citoyennes, chers citoyens, l'ouverture de ce nouveau portail marque une étape décisive dans la modernisation de nos services publics. Notre ambition est de vous offrir une mairie accessible 24h/24 et 7j/7, au cœur de l'ère numérique, tout en préservant la richesse de notre patrimoine naturel et culturel."</p>
                  <strong>— Le Maire de Dembéni</strong>
                </div>
              </div>
            </motion.div>

            {/* Service Accéléré (Medium) */}
            <motion.div className="bento-item bento-medium" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp}>
              <div className="feature-bento-icon"><Shield size={24} /></div>
              <h4>Services Sécurisés</h4>
              <p>Vos données personnelles sont stockées et traitées avec les protocoles de sécurité les plus avancés. Effectuez vos démarches en toute confiance.</p>
            </motion.div>

            {/* Actualité Principale (Small) */}
            <motion.div className="bento-item bento-small" style={{ padding: 0 }} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp}>
              <ResponsiveImage src={news2} alt="Urbanisme" className="bento-bg-img" />
              <div className="bento-overlay">
                <span style={{ color: '#10b981', fontWeight: 800, marginBottom: '5px' }}>NOUVEAU</span>
                <h4>Projet d'Urbanisme</h4>
                <p style={{ opacity: 0.9 }}>Découvrez les futurs aménagements du centre-ville.</p>
              </div>
            </motion.div>

            {/* Patrimoine (Small) */}
            <motion.div className="bento-item bento-small" style={{ padding: 0 }} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp}>
              <ResponsiveImage src={heritageImg} alt="Patrimoine" className="bento-bg-img" />
              <div className="bento-overlay">
                <span style={{ color: '#10b981', fontWeight: 800, marginBottom: '5px' }}>DÉCOUVERTE</span>
                <h4>Notre Patrimoine</h4>
                <p style={{ opacity: 0.9 }}>L'histoire riche de nos 5 villages authentiques.</p>
              </div>
            </motion.div>

            {/* Accès Rapide Démarches (Small) */}
            <motion.div className="bento-item bento-small" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp}>
              <div className="feature-bento-icon" style={{ background: '#10b981' }}><FileText size={24} /></div>
              <h4>Accès Citoyen</h4>
              <p>Gagnez du temps en créant votre espace citoyen. Suivi de dossiers en temps réel.</p>
              <Link to="/login" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '15px' }}>
                Se connecter <ChevronRight size={18} />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- SERVICES PUBLICS (Rich Imagery) --- */}
      <section className="premium-section" style={{ background: 'white' }}>
        <div className="premium-container">
          <div className="section-header-premium">
            <h2>L'essentiel pour votre quotidien</h2>
            <p>Accédez rapidement aux informations qui vous concernent.</p>
          </div>

          <div className="bento-grid" style={{ gridAutoRows: '250px' }}>
            <Link to="/culture" className="bento-item bento-wide" style={{ padding: 0, textDecoration: 'none' }}>
              <ResponsiveImage src={cultureImg} alt="Culture" className="bento-bg-img" />
              <div className="bento-overlay">
                <h4><Palmtree size={24} style={{ display: 'inline', marginRight: '10px' }} /> Vie Culturelle & Sportive</h4>
                <p>Événements, associations, stades et médiathèques de la commune.</p>
              </div>
            </Link>
            
            <Link to="/services" className="bento-item bento-small" style={{ padding: 0, textDecoration: 'none' }}>
              <ResponsiveImage src={servicesImg} alt="Santé" className="bento-bg-img" />
              <div className="bento-overlay">
                <h4><GraduationCap size={24} style={{ display: 'inline', marginRight: '10px' }} /> Éducation</h4>
                <p>Inscriptions, cantine et activités périscolaires.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
