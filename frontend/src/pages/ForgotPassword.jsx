import React, { useState, useEffect } from 'react';
import api from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle, ArrowRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import '../styles/ForgotPassword.css';

const AUTH_API_URL = '/api/auth';

const EmailStep = ({ onEmailSubmit, loading, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onEmailSubmit(email);
  };

  return (
    <motion.form 
      className="forgot-password-form" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="form-title">Mot de passe oublié ?</h2>
      <p className="form-description">Entrez votre adresse e-mail pour recevoir un code de vérification.</p>
      
      <div className="input-group">
        <Mail size={20} className="input-icon" />
        <input
          type="email"
          placeholder="Votre adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      {error && <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
      
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <><ArrowRight size={20} /> Envoyer le code</>
        )}
      </button>
    </motion.form>
  );
};

const OtpStep = ({ email, onOtpSubmit, onResendOtp, loading, error, resendTimer, resendLoading }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onOtpSubmit(otp);
  };

  return (
    <motion.form 
      className="forgot-password-form" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="form-title">Vérifier votre e-mail</h2>
      <p className="form-description">Un code de vérification a été envoyé à <strong>{email}</strong>. Veuillez le saisir ci-dessous.</p>
      
      <div className="input-group">
        <Lock size={20} className="input-icon" />
        <input
          type="text"
          placeholder="Code de vérification (6 chiffres)"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          required
          disabled={loading}
        />
      </div>
      {error && <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <><CheckCircle size={20} /> Vérifier le code</>
        )}
      </button>

      <div className="resend-otp-section">
        {resendTimer > 0 ? (
          <p>Renvoyer le code dans {resendTimer}s</p>
        ) : (
          <button type="button" className="resend-button" onClick={onResendOtp} disabled={resendLoading}>
            {resendLoading ? (
              <span className="spinner small"></span>
            ) : (
              <><RotateCcw size={16} /> Renvoyer le code</>
            )}
          </button>
        )}
      </div>
    </motion.form>
  );
};

const ResetPasswordStep = ({ email, otp, onResetPassword, loading, error }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);

  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  const validatePassword = (password) => {
    const errors = [];
    let strength = 0;

    if (password.length < 8) errors.push("Minimum 8 caractères"); else strength++;
    if (!/[A-Z]/.test(password)) errors.push("Une lettre majuscule"); else strength++;
    if (!/[a-z]/.test(password)) errors.push("Une lettre minuscule"); else strength++;
    if (!/[0-9]/.test(password)) errors.push("Un chiffre"); else strength++;
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("Un caractère spécial"); else strength++;

    setPasswordErrors(errors);
    setPasswordStrength(strength);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordErrors.length > 0) {
      toast.error("Veuillez corriger les erreurs de mot de passe.");
      return;
    }
    onResetPassword(email, otp, newPassword);
  };

  const getStrengthColor = () => {
    if (passwordStrength === 5) return '#22c55e'; // Strong
    if (passwordStrength >= 3) return '#facc15'; // Medium
    return '#ef4444'; // Weak
  };

  return (
    <motion.form 
      className="forgot-password-form" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="form-title">Nouveau mot de passe</h2>
      <p className="form-description">Veuillez saisir et confirmer votre nouveau mot de passe.</p>
      
      <div className="input-group">
        <Lock size={20} className="input-icon" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
        />
        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>
      <div className="password-strength-bar">
        <div className="strength-fill" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div>
      </div>
      {passwordErrors.length > 0 && (
        <ul className="password-errors">
          {passwordErrors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )}

      <div className="input-group">
        <Lock size={20} className="input-icon" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>
      {error && <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

      <button type="submit" className="submit-button" disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword}>
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <><CheckCircle size={20} /> Réinitialiser le mot de passe</>
        )}
      </button>
    </motion.form>
  );
};

const SuccessStep = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div 
      className="forgot-password-form success-message-card" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle size={60} className="success-icon" />
      <h2 className="form-title">Succès !</h2>
      <p className="form-description">Votre mot de passe a été réinitialisé avec succès.</p>
      <p className="form-description">Vous allez être redirigé vers la page de connexion...</p>
    </motion.div>
  );
};

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    let timerInterval;
    if (resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [resendTimer]);

  const handleEmailSubmit = async (submittedEmail) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${AUTH_API_URL}/forgot-password`, { email: submittedEmail });
      toast.success(res.data.message);
      setEmail(submittedEmail);
      setStep('otp');
      setResendTimer(60); // Start 60-second timer for resend
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (submittedOtp) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${AUTH_API_URL}/verify-otp`, { email, otp: submittedOtp });
      toast.success(res.data.message);
      setOtp(submittedOtp);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Code de vérification invalide.');
      toast.error(err.response?.data?.message || 'Code de vérification invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await api.post(`${AUTH_API_URL}/resend-otp`, { email });
      toast.success(res.data.message);
      setResendTimer(60); // Reset timer
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code.');
      toast.error(err.response?.data?.message || 'Erreur lors du renvoi du code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (submittedEmail, submittedOtp, newPassword) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${AUTH_API_URL}/reset-password`, { email: submittedEmail, otp: submittedOtp, newPassword });
      toast.success(res.data.message);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
      toast.error(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <AnimatePresence mode="wait">
        {step === 'email' && (
          <EmailStep key="email" onEmailSubmit={handleEmailSubmit} loading={loading} error={error} />
        )}
        {step === 'otp' && (
          <OtpStep 
            key="otp" 
            email={email} 
            onOtpSubmit={handleOtpSubmit} 
            onResendOtp={handleResendOtp}
            loading={loading}
            error={error}
            resendTimer={resendTimer}
            resendLoading={resendLoading}
          />
        )}
        {step === 'reset' && (
          <ResetPasswordStep key="reset" email={email} otp={otp} onResetPassword={handleResetPassword} loading={loading} error={error} />
        )}
        {step === 'success' && (
          <SuccessStep key="success" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
