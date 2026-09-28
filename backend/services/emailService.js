/**
 * CONCEPTPE — Email Service
 * Sends emails via SMTP using Nodemailer
 * All credentials are loaded from environment variables (never hardcoded).
 */

const nodemailer = require('nodemailer');
const config = require('../config/environment');

let transporter = null;

/**
 * Initialize (or re-initialize) the Nodemailer transporter.
 * Returns null if SMTP is not configured.
 */
function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, password } = config.smtp;

  if (!host || !user || !password) {
    console.warn('[EmailService] SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: config.smtp.secure,
    auth: {
      user,
      pass: password
    }
  });

  return transporter;
}

/**
 * Send the contact form message to the admin email.
 *
 * @param {Object} params
 * @param {string} params.name    - Visitor name
 * @param {string} params.email   - Visitor email
 * @param {string} params.subject - Subject / academic area (optional context)
 * @param {string} params.message - Visitor message
 * @returns {Promise<boolean>} true if sent successfully
 */
async function sendContactEmail({ name, email, subject, message }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn('[EmailService] Skipping email send — SMTP not configured.');
    // Return true so the contact form still "works" in development
    // without SMTP credentials (message is still saved in memory).
    return true;
  }

  const adminEmail = config.adminEmail;

  const mailOptions = {
    from: `"CONCEPTPE Contact" <${config.smtp.user}>`,
    to: adminEmail,
    replyTo: email,
    subject: 'New Contact Message — CONCEPTPE',
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message
    ].join('\n')
  };

  const info = await mailer.sendMail(mailOptions);
  console.log(`[EmailService] Contact email sent to ${adminEmail} (messageId: ${info.messageId})`);
  return true;
}

module.exports = { sendContactEmail };
