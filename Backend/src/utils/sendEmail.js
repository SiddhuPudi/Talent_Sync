const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is not set in environment variables");
    return null;
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  // Verify connection on first use
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Email transporter verification failed:", err.message);
      console.error("   → Make sure EMAIL_USER is your Gmail address");
      console.error("   → Make sure EMAIL_PASS is a valid Gmail App Password (not your regular password)");
      console.error("   → To generate an App Password: Google Account → Security → 2FA → App Passwords");
      transporter = null;
    } else {
      console.log("✅ Email transporter is ready");
    }
  });
  return transporter;
}

const sendEmail = async ({ to, subject, message }) => {
  const t = getTransporter();
  if (!t) {
    throw new Error("Email service is not configured. Check EMAIL_USER and EMAIL_PASS.");
  }

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
    `,
  };
  await t.sendMail(mailOptions);
  console.log(`✅ Email sent successfully to ${to}`);
};

module.exports = sendEmail;
