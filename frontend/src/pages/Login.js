import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import logo from '../images/LOGO.jpg';
import '../styles/SignupPremium.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'CITOYEN') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
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
        {/* LEFT PANEL */}
        <div className="signup-left-panel">
          <motion.div className="signup-brand" variants={itemVariants}>
            <img src={logo} alt="Dembéni Logo" />
            <span>DEMBENI</span>
          </motion.div>
          
          <motion.div className="signup-welcome" variants={itemVariants}>
            <h1>Bienvenue<br/>de retour.</h1>
            <p>Connectez-vous pour accéder à votre espace citoyen, suivre vos demandes et gérer vos démarches en toute simplicité.</p>
          </motion.div>

          <motion.div className="signup-features" variants={itemVariants}>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <span>Connexion sécurisée</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right-panel">
          <motion.div variants={itemVariants}>
            <h2>Se connecter</h2>
            <p>Entrez vos identifiants pour continuer.</p>
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
          </AnimatePresence>

          <motion.form onSubmit={handleSubmit} className="signup-form" variants={itemVariants}>
            
            {/* Email */}
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Adresse email"
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Mot de passe"
              />
            </div>

            {/* Options */}
            <div className="login-options-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="terms-group" style={{ marginTop: 0 }}>
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe" style={{ margin: 0, paddingTop: '2px' }}>Se souvenir de moi</label>
              </div>
              <Link to="/forgot-password" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>Mot de passe oublié ?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Connexion...' : 'SE CONNECTER'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </motion.form>

          <motion.div className="login-link" variants={itemVariants}>
            Nouveau citoyen ? <Link to="/signup">S'inscrire ici</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
