/**
 * CONCEPTPE — Contact Service
 * Validates and stores incoming contact/inquiry messages
 * Sends notification email to admin via EmailService
 */

// In-memory data store for contact submissions
const contactSubmissions = [];
const { sendContactEmail } = require('./emailService');

class ContactService {
  validateContactInput({ name, email, message }) {
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim().toLowerCase())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.push({ field: 'message', message: 'Message must be at least 10 characters long.' });
    } else if (message.trim().length > 500) {
      errors.push({ field: 'message', message: 'Message cannot exceed 500 characters.' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async saveMessage({ name, email, subject, message }) {
    const validation = this.validateContactInput({ name, email, message });
    if (!validation.isValid) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.details = validation.errors;
      throw error;
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'general').trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    contactSubmissions.push(newMessage);

    // Send notification email to admin
    try {
      await sendContactEmail({
        name: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        message: newMessage.message
      });
      newMessage.status = 'sent';
    } catch (emailErr) {
      console.error('[ContactService] Failed to send email:', emailErr.message);
      newMessage.status = 'email_failed';
      const error = new Error('Unable to send your message right now. Please try again.');
      error.statusCode = 502;
      throw error;
    }

    return newMessage;
  }

  async getRecentMessages() {
    return contactSubmissions.slice(-20);
  }
}

module.exports = new ContactService();

