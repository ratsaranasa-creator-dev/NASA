const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Adresse e-mail de l'expéditeur
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès à', to);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
    throw new Error('Erreur lors de l\'envoi de l\'e-mail de vérification.');
  }
};

module.exports = sendEmail;
