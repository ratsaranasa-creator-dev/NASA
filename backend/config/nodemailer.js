const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 0);
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

const isEmailConfigured = Boolean(
  EMAIL_HOST &&
  EMAIL_PORT &&
  EMAIL_USER &&
  EMAIL_PASS &&
  EMAIL_FROM
);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.warn('[backend] Nodemailer warning: transporter verification failed.', err.message);
    } else {
      console.log('[backend] Nodemailer transporter is configured and ready.');
    }
  });
} else {
  console.warn('[backend] Email service disabled. SMTP environment variables are not fully configured.');
}

const sendEmail = async (to, subject, text, html) => {
  if (!isEmailConfigured || !transporter) {
    const message = '[backend] Email not sent: missing SMTP configuration. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM.';
    console.warn(message);
    throw new Error(message);
  }

  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('[backend] Email sent successfully to', to);
  } catch (error) {
    console.error('[backend] Error sending email:', error.message);
    throw new Error('Erreur lors de l\'envoi de l\'e-mail de vérification.');
  }
};

module.exports = sendEmail;
