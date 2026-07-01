import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance'; // Import api
import { motion } from 'framer-motion';
import logo from '../images/LOGO.jpg';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // État pour afficher/masquer le mot de passe de confirmation
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Jeton de réinitialisation manquant.');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une lettre majuscule.';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une lettre minuscule.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre.';
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un caractère spécial.';
    }
    return ''; // Mot de passe valide
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      await api.put(`/api/auth/reset-password/${token}`, { password });
      setMessage('Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-v2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card auth-card-v2"
      >
        <div className="auth-left-panel">
          <div className="login-logo-container">
            <img src={logo} alt="Dembéni Logo" className="login-logo" />
            <span className="login-brand-name">DEMBENI</span>
          </div>
          <h1>Réinitialiser votre mot de passe</h1>
          <p className="auth-intro">Veuillez entrer votre nouveau mot de passe ci-dessous.</p>
          <p className="auth-link-note">Retour à la <Link to="/login">connexion</Link></p>
          <div className="login-footer-note">© 2026 Admin Dembeni</div>
        </div>

        <div className="auth-right-panel">
          <form onSubmit={handleSubmit} className="auth-form auth-form-v2">
            <h3>Nouveau mot de passe</h3>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <div className="form-group">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Nouveau mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirmer le mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-auth btn-auth-v2">
              {loading ? 'Réinitialisation en cours...' : 'RÉINITIALISER LE MOT DE PASSE'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
