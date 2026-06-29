import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Camera, CheckCircle2, FileText, ArrowRight, AlertCircle, Check } from 'lucide-react';
import logo from '../images/LOGO.jpg';
import '../styles/SignupPremium.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = useCallback(async (credentialResponse) => {
    const parseJwt = (token) => {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    };

    try {
      const decoded = parseJwt(credentialResponse.credential);
      const [firstName, ...lastNameParts] = (decoded.name || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      setFormData(prev => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastName || '',
        email: decoded.email || '',
        password: Math.random().toString(36).slice(-12),
        confirmPassword: '',
        acceptTerms: false
      }));
      
      setError('');
      alert('Informations Google récupérées! Veuillez confirmer le mot de passe et valider l\'inscription.');
    } catch (err) {
      setError('Erreur lors de la récupération des données Google');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleGoogleSignIn]);

  const handleCustomGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Le SDK Google Sign-In n\'est pas chargé.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('firstName', formData.firstName);
      dataToSend.append('lastName', formData.lastName);
      dataToSend.append('email', formData.email);
      dataToSend.append('password', formData.password);
      if (profilePicture) {
        dataToSend.append('profilePicture', profilePicture);
      }

      await register(dataToSend);
      setSuccess('Inscription réussie ! Votre compte doit être validé par un administrateur.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
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
    <div className="signup-premium-page">
      <motion.div 
        className="signup-premium-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT PANEL: Branding & Info */}
        <div className="signup-left-panel">
          <motion.div className="signup-brand" variants={itemVariants}>
            <img src={logo} alt="Logo Dembeni" />
            <span>DEMBENI</span>
          </motion.div>
          
          <motion.div className="signup-welcome" variants={itemVariants}>
            <h1>Rejoignez <br/>votre ville.</h1>
            <p>Créez votre compte citoyen pour accéder à tous vos services administratifs, suivre vos démarches en ligne et participer à la vie de la commune.</p>
          </motion.div>

          <motion.div className="signup-features" variants={itemVariants}>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FileText size={24} />
              </div>
              <span>Démarches 100% en ligne</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle2 size={24} />
              </div>
              <span>Suivi en temps réel</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="signup-right-panel">
          <motion.div variants={itemVariants}>
            <h2>Créer un compte</h2>
            <p>Remplissez les informations ci-dessous pour démarrer.</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, height: 0 }}
                className="message error"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, height: 0 }}
                className="message success"
              >
                <Check size={20} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form onSubmit={handleSubmit} className="signup-form" variants={itemVariants}>
            
            {/* Profile Picture Upload */}
            <div className="profile-upload-section">
              <label htmlFor="profile-upload" className="profile-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Aperçu" />
                ) : (
                  <Camera className="profile-preview-icon" size={28} />
                )}
              </label>
              <div className="profile-upload-text">
                <label htmlFor="profile-upload">Photo de profil (Optionnel)</label>
                <span>Format JPG, PNG. Max 2MB.</span>
              </div>
              <input 
                id="profile-upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
            </div>

            {/* Names Row */}
            <div className="input-row">
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="Prénom" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Nom" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="Adresse email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Passwords Row */}
            <div className="input-row">
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Mot de passe" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirmer" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Terms */}
            <div className="terms-group">
              <input 
                type="checkbox" 
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              /> 
              <label htmlFor="acceptTerms">
                J'accepte les <Link to="#">conditions d'utilisation</Link> et la <Link to="#">politique de confidentialité</Link>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Création en cours...' : "S'inscrire"}
              {!loading && <ArrowRight size={20} />}
            </button>

            <div className="divider">OU</div>

            <button type="button" onClick={handleCustomGoogleSignIn} className="btn-google">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
              S'inscrire avec Google
            </button>
          </motion.form>

          <motion.div className="login-link" variants={itemVariants}>
            Déjà citoyen ? <Link to="/login">Se connecter ici</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
