const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a test account if no email configuration is provided
  let transporter;
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  // Log URL for development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail; 