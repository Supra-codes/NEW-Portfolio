const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = async () => {
  // If transporter is already initialized, return it
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log('📬 Email Service: Initializing SMTP transporter with custom credentials...');
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
  } else {
    console.warn('📬 Email Service: SMTP credentials not provided in .env.');
    console.warn('📬 Email Service: Generating a temporary test account using Ethereal Email...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('🟢 Temporary Ethereal SMTP transporter created successfully.');
      console.log(`🔑 Test User: ${testAccount.user}`);
      console.log(`🔑 Test Pass: ${testAccount.pass}`);
    } catch (err) {
      console.error('🔴 Failed to create test email account, falling back to mock logger.', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('📝 [Mock Email Sent]:', mailOptions);
          return { messageId: 'mock_message_id_' + Date.now(), mock: true };
        }
      };
    }
  }

  return transporter;
};

const sendContactEmails = async ({ name, email, subject, message }) => {
  try {
    const mailClient = await initTransporter();
    const destination = process.env.CONTACT_EMAIL || 'your.email@example.com';

    // 1. Notification Email to Portfolio Owner
    const ownerMailOptions = {
      from: `"Portfolio Contact Form" <${email}>`,
      to: destination,
      subject: `💼 New Portfolio Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fafafa;">
          <h2 style="color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 10px;">New Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 20px; padding: 15px; background: #fff; border-left: 5px solid #4A90E2; border-radius: 4px; font-style: italic;">
            "${message.replace(/\n/g, '<br>')}"
          </div>
          <p style="font-size: 11px; color: #888; margin-top: 30px;">Sent from your Portfolio contact form.</p>
        </div>
      `
    };

    // 2. Automated Confirmation Email to the Sender (User experience detail!)
    const senderMailOptions = {
      from: `"Portfolio Notification" <${destination}>`,
      to: email,
      subject: `Thank you for reaching out!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6c5ce7;">Hi ${name},</h2>
          <p>Thank you for visiting my portfolio website and getting in touch! This is an automated message to let you know that I have received your email.</p>
          <p>Here is a summary of the details you sent:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="font-style: italic; white-space: pre-wrap;">"${message}"</p>
          </div>
          <p>I will review your message and get back to you as soon as possible.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Portfolio Administration</strong></p>
        </div>
      `
    };

    const ownerInfo = await mailClient.sendMail(ownerMailOptions);
    const senderInfo = await mailClient.sendMail(senderMailOptions);

    // If using Ethereal email, output the URL to the console so developers can inspect it!
    if (ownerInfo.messageId && nodemailer.getTestMessageUrl) {
      const ownerUrl = nodemailer.getTestMessageUrl(ownerInfo);
      const senderUrl = nodemailer.getTestMessageUrl(senderInfo);
      if (ownerUrl) {
        console.log(`🔗 View Owner Notification Email: ${ownerUrl}`);
      }
      if (senderUrl) {
        console.log(`🔗 View Sender Confirmation Email: ${senderUrl}`);
      }
      return {
        success: true,
        ownerUrl,
        senderUrl
      };
    }

    return { success: true };
  } catch (err) {
    console.error('🔴 Error sending emails through Email Service:', err.message);
    // Do not crash the application, just log and return success: false
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendContactEmails
};
