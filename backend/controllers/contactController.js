/**
 * Contact Controller
 * Handles POST /api/contact
 */

const contactService = require('../services/contactService');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body || {};

    const savedMessage = await contactService.saveMessage({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      data: {
        id: savedMessage.id,
        createdAt: savedMessage.createdAt,
        status: savedMessage.status
      }
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.details
      });
    }
    if (err.statusCode === 502) {
      return res.status(502).json({
        success: false,
        error: err.message || 'Unable to send your message right now. Please try again.'
      });
    }
    next(err);
  }
};

const getRecentInquiries = async (req, res, next) => {
  try {
    const messages = await contactService.getRecentMessages();
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitContact,
  getRecentInquiries
};
