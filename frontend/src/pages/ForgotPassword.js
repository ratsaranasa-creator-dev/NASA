import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, Check, Key } from 'lucide-react';
import logo from '../images/LOGO.jpg';
import api, { API_URL } from '../apiConfig';
import '../styles/SignupPremium.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse e-mail valide.');
      setLoading(false);
      return;
    }

    try {
      await api.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage('Si votre adresse e-mail est enregistrée, un lien de réinitialisation vous a été envoyé.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la demande de réinitialisation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Mot de passe<br />oublié ?</h1>
            <p>Pas de panique ! Entrez votre adresse e-mail et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.</p>
          </motion.div>

          <motion.div className="signup-features" variants={itemVariants}>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Key size={24} />
              </div>
              <span>Récupération rapide</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right-panel">
          <motion.div variants={itemVariants}>
            <h2>Réinitialiser</h2>
            <p>Saisissez l'adresse e-mail associée à votre compte.</p>
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
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="message success"
              >
                <Check size={20} />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form onSubmit={handleSubmit} className="signup-form" variants={itemVariants}>

            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Votre adresse email"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Envoi en cours...' : 'ENVOYER LE LIEN'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </motion.form>

          <motion.div className="login-link" variants={itemVariants}>
            Retour à la <Link to="/login">connexion</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
