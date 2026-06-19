const { Message } = require('../models');
const { sendContactEmails } = require('../services/emailService');

// Handle contact form submission
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to Database (MongoDB or JSON fallback)
    const savedMessage = await Message.create({
      name,
      email,
      subject: subject || 'General Inquiry',
      message
    });

    console.log(`✉️ Message saved to database: ID ${savedMessage._id} from ${email}`);

    // 2. Send Emails (Owner Notification & Sender Confirmation)
    const emailResult = await sendContactEmails({
      name,
      email,
      subject: subject || 'General Inquiry',
      message
    });

    // 3. Return response with details
    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted and stored successfully.',
      data: {
        id: savedMessage._id,
        emailSent: emailResult.success,
        emailUrls: emailResult.success && emailResult.ownerUrl ? {
          ownerNotification: emailResult.ownerUrl,
          senderConfirmation: emailResult.senderUrl
        } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitContactForm
};
