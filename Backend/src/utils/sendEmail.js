const nodemailer = require("nodemailer");

let transporter = null;
let transporterReady = false;

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is not set in environment variables");
    console.error("   EMAIL_USER:", user ? `${user.substring(0, 3)}***` : "NOT SET");
    console.error("   EMAIL_PASS:", pass ? "SET (hidden)" : "NOT SET");
    return null;
  }
  console.log(`📧 Creating email transporter for: ${user}`);
  // Use explicit SMTP settings instead of the "gmail" service shorthand
  // This is more reliable on cloud platforms like Render
  const t = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user,
      pass,
    },
    // Increase timeouts for cloud environments
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return t;
}

async function getTransporter() {
  if (transporter && transporterReady) {
    return transporter;
  }
  transporter = createTransporter();
  if (!transporter) {
    return null;
  }
  // Actually await the verification instead of fire-and-forget
  try {
    await transporter.verify();
    transporterReady = true;
    console.log("✅ Email transporter verified and ready");
    return transporter;
  } catch (err) {
    console.error("❌ Email transporter verification failed:", err.message);
    console.error("   Full error:", JSON.stringify({
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode
    }));
    console.error("   → Make sure EMAIL_USER is your Gmail address");
    console.error("   → Make sure EMAIL_PASS is a valid 16-character Gmail App Password");
    console.error("   → To generate: Google Account → Security → 2-Step Verification → App Passwords");
    // Reset so next attempt creates a fresh transporter
    transporter = null;
    transporterReady = false;
    return null;
  }
}

const sendEmail = async ({ to, subject, message }) => {
  const t = await getTransporter();
  if (!t) {
    throw new Error(
      "Email service is not configured or Gmail rejected the credentials. " +
      "Check server logs for details."
    );
  }

  const mailOptions = {
    from: `"Talent Sync" <${process.env.EMAIL_USER}>`,
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

  try {
    const info = await t.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    console.error("   Error code:", err.code);
    console.error("   Response:", err.response);
    
    // Reset transporter on auth errors so it re-verifies next time
    if (err.code === "EAUTH" || err.responseCode === 535) {
      transporter = null;
      transporterReady = false;
    }
    
    throw err;
  }
};

module.exports = sendEmail;
