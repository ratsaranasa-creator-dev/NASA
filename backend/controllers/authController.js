const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/nodemailer');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
if (!process.env.JWT_SECRET) {
  console.warn('[backend] JWT_SECRET is not set. Using insecure fallback secret. Set JWT_SECRET in Render Environment Variables for production.');
}

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (Visitor -> Citizen request)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'CITOYEN', // They request to be a citizen
      status: 'PENDING', // Pending admin approval
      profilePicture,
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful. Waiting for admin approval.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.role === 'CITOYEN' && user.status !== 'APPROVED') {
        return res.status(403).json({ message: 'Your account is pending admin approval.' });
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cette adresse e-mail.' });
    }

    // Invalidate any existing OTPs for this email
    await OTP.deleteMany({ email });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = await OTP.create({
      email,
      code: otpCode,
      expiresAt,
    });

    const message = `
      <p>Bonjour,</p>
      <p>Votre code de vérification pour la réinitialisation de votre mot de passe est :</p>
      <h2 style="color: #16a34a; font-size: 24px; text-align: center; letter-spacing: 5px;">${otpCode}</h2>
      <p>Ce code est valable pendant 10 minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
    `;

    try {
      await sendEmail(user.email, 'Réinitialisation de votre mot de passe', '', message);
      res.status(200).json({ message: 'Un code de vérification a été envoyé à votre adresse e-mail.' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      await OTP.findByIdAndDelete(otp._id); // Delete OTP if email sending fails
      res.status(500).json({ message: 'Erreur lors de l\'envoi du code de vérification.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, code: otp });

    if (!otpRecord) {
      // If OTP is incorrect, increment attempts on any existing OTP for this email
      const existingOtp = await OTP.findOne({ email });
      if (existingOtp) {
        existingOtp.attempts += 1;
        await existingOtp.save();
        if (existingOtp.attempts >= 5) {
          await OTP.findByIdAndDelete(existingOtp._id); // Block OTP after 5 attempts
          return res.status(400).json({ message: 'Trop de tentatives. Veuillez demander un nouveau code.' });
        }
      }
      return res.status(400).json({ message: 'Code incorrect.' });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'Le code a expiré. Veuillez demander un nouveau code.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'Trop de tentatives. Veuillez demander un nouveau code.' });
    }

    // OTP is valid, proceed to next step (reset password)
    res.status(200).json({ message: 'Code vérifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, code: otp });

    if (!otpRecord || otpRecord.expiresAt < Date.now() || otpRecord.attempts >= 5) {
      return res.status(400).json({ message: 'Code invalide ou expiré. Veuillez demander un nouveau code.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash this
    await user.save();

    await OTP.findByIdAndDelete(otpRecord._id); // Delete OTP after successful reset

    res.status(200).json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP for password reset
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cette adresse e-mail.' });
    }

    // Invalidate any existing OTPs for this email
    await OTP.deleteMany({ email });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = await OTP.create({
      email,
      code: otpCode,
      expiresAt,
    });

    const message = `
      <p>Bonjour,</p>
      <p>Votre nouveau code de vérification pour la réinitialisation de votre mot de passe est :</p>
      <h2 style="color: #16a34a; font-size: 24px; text-align: center; letter-spacing: 5px;">${otpCode}</h2>
      <p>Ce code est valable pendant 10 minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
    `;

    try {
      await sendEmail(user.email, 'Nouveau code de réinitialisation de mot de passe', '', message);
      res.status(200).json({ message: 'Un nouveau code de vérification a été envoyé à votre adresse e-mail.' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      await OTP.findByIdAndDelete(otp._id); // Delete OTP if email sending fails
      res.status(500).json({ message: 'Erreur lors de l\'envoi du nouveau code de vérification.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
