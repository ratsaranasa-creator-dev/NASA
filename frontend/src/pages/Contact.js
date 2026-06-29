import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, AlertCircle, User, MessageSquare, Tag } from 'lucide-react';

import logo from '../images/LOGO.jpg';
import '../styles/SignupPremium.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    service: 'Etat Civil',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'Le prénom est requis';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Le nom est requis';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = 'L\'adresse email est requise';
        else if (!emailRegex.test(value)) error = 'Format d\'email invalide';
        break;
      case 'subject':
        if (!value.trim()) error = 'L\'objet est requis';
        break;
      case 'message':
        if (!value.trim()) error = 'Le message est requis';
        else if (value.length < 10) error = 'Le message est trop court';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ type: 'error', message: 'Veuillez corriger les erreurs dans le formulaire.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStatus({ type: 'success', message: 'Votre message a été envoyé avec succès ! Nous vous répondrons sous 48h.' });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        service: 'Etat Civil',
        subject: '',
        message: ''
      });
      setErrors({});
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }, 1500);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="signup-premium-page" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh', height: 'auto' }}>
      <motion.div 
        className="signup-premium-container"
        style={{ maxWidth: '1100px', margin: '0 auto', overflow: 'hidden' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT PANEL */}
        <div className="signup-left-panel">
          <motion.div className="signup-brand" variants={itemVariants}>
            <img src={logo} alt="Dembéni Logo" />
            <span>DEMBENI</span>
          </motion.div>
          
          <motion.div className="signup-welcome" variants={itemVariants}>
            <h1>Contactez<br/>la Mairie.</h1>
            <p>Une question ? Un dossier en cours ? Notre équipe municipale est à votre écoute pour vous accompagner dans vos démarches.</p>
          </motion.div>

          <motion.div className="signup-features" variants={itemVariants} style={{ marginTop: '2rem' }}>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <MapPin size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold' }}>Adresse</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Hôtel de Ville, RN 3<br/>97680 Dembéni, Mayotte</span>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Phone size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold' }}>Téléphone</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Standard : +262 269 62 15 20</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Mail size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold' }}>Email</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>contact@dembeni.yt</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Clock size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold' }}>Ouverture</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Lun-Jeu: 8h-16h30 | Ven: 8h-11h30</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right-panel" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
          <motion.div variants={itemVariants}>
            <h2>Envoyer un message</h2>
            <p>Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>
          </motion.div>

          <AnimatePresence>
            {status.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, height: 0 }}
                className={`message ${status.type === 'error' ? 'error' : 'success'}`}
                style={status.type === 'success' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' } : {}}
              >
                {status.type === 'error' ? <AlertCircle size={20} /> : <ShieldCheck size={20} />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form onSubmit={handleSubmit} className="signup-form" variants={itemVariants} noValidate>
            
            <div className="input-group-row">
              {/* Prénom */}
              <div className="input-group" style={{ marginBottom: errors.firstName ? '25px' : '15px' }}>
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="Prénom"
                  className={errors.firstName ? 'error-border' : ''}
                />
                {errors.firstName && <span className="error-text-inline" style={{ position: 'absolute', bottom: '-20px', left: '10px', fontSize: '0.75rem', color: '#ef4444' }}>{errors.firstName}</span>}
              </div>

              {/* Nom */}
              <div className="input-group" style={{ marginBottom: errors.lastName ? '25px' : '15px' }}>
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Nom"
                  className={errors.lastName ? 'error-border' : ''}
                />
                {errors.lastName && <span className="error-text-inline" style={{ position: 'absolute', bottom: '-20px', left: '10px', fontSize: '0.75rem', color: '#ef4444' }}>{errors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="input-group" style={{ marginBottom: errors.email ? '25px' : '15px' }}>
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Adresse email"
                className={errors.email ? 'error-border' : ''}
              />
              {errors.email && <span className="error-text-inline" style={{ position: 'absolute', bottom: '-20px', left: '10px', fontSize: '0.75rem', color: '#ef4444' }}>{errors.email}</span>}
            </div>

            {/* Service */}
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <ShieldCheck className="input-icon" size={20} />
              <select 
                name="service"
                value={formData.service}
                onChange={handleChange}
                style={{ width: '100%', padding: '14px 14px 14px 45px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '12px', fontSize: '0.95rem', background: '#f9fafb', color: '#1f2937', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Etat Civil">État Civil / Citoyenneté</option>
                <option value="Urbanisme">Urbanisme / Travaux</option>
                <option value="Scolaire">Vie Scolaire / Petite enfance</option>
                <option value="Social">Action Sociale (CCAS)</option>
                <option value="Collecte">Propreté / Déchets</option>
                <option value="Autre">Autre demande</option>
              </select>
            </div>

            {/* Objet */}
            <div className="input-group" style={{ marginBottom: errors.subject ? '25px' : '15px' }}>
              <Tag className="input-icon" size={20} />
              <input 
                type="text" 
                name="subject"
                value={formData.subject} 
                onChange={handleChange} 
                placeholder="Objet de votre demande"
                className={errors.subject ? 'error-border' : ''}
              />
              {errors.subject && <span className="error-text-inline" style={{ position: 'absolute', bottom: '-20px', left: '10px', fontSize: '0.75rem', color: '#ef4444' }}>{errors.subject}</span>}
            </div>

            {/* Message */}
            <div className="input-group" style={{ marginBottom: errors.message ? '25px' : '20px', alignItems: 'flex-start' }}>
              <MessageSquare className="input-icon" size={20} style={{ top: '15px', transform: 'none' }} />
              <textarea 
                name="message"
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Détaillez votre message ici..."
                rows="4"
                className={errors.message ? 'error-border' : ''}
                style={{ width: '100%', padding: '14px 14px 14px 45px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '12px', fontSize: '0.95rem', background: '#f9fafb', resize: 'vertical', minHeight: '120px' }}
              />
              {errors.message && <span className="error-text-inline" style={{ position: 'absolute', bottom: '-20px', left: '10px', fontSize: '0.75rem', color: '#ef4444' }}>{errors.message}</span>}
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Envoi en cours...' : 'ENVOYER LE MESSAGE'}
              {!loading && <Send size={20} />}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginTop: '15px' }}>
              Vos données sont protégées. Elles ne seront pas partagées avec des tiers.
            </p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;