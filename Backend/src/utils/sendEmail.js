const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, message }) => {
  try {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Talent Sync</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">${message}</p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = sendEmail;
