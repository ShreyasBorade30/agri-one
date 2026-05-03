import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Agri-One Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.verify(); // Test the connection
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Email Transport Error: ${error.message}`);
  }
};

export default sendEmail;
