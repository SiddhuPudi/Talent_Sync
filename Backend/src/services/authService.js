const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

// In-memory OTP store
// Map key: email, value: { otp, type, data, expiresAt }
const otpStore = new Map();

async function sendEmailOTP(email, otp) {
  await sendEmail({
    to: email,
    subject: "Your Talent Sync Verification Code",
    message: `
      <div style="text-align: center;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Your verification code is:</p>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4F46E5;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #9CA3AF;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

async function generateAndSendOTP(email, type, additionalData = {}) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, type, data: additionalData, expiresAt });
  try {
    await sendEmailOTP(email, otp);
  } catch (error) {
    // Clean up the OTP if email fails
    otpStore.delete(email);
    console.error("❌ OTP email send failed:", error.message);
    throw new Error("Failed to send verification email. Please check server configuration.");
  }
  return true;
}

async function registerUser(data) {
  const { name, email, password } = data;
  // Backend Validation
  if (!email.endsWith("@gmail.com")) {
    throw new Error("Only Gmail accounts allowed");
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters and include letters and numbers"
    );
  }
  const exisitingUser = await prisma.user.findUnique({ where: { email } });
  if (exisitingUser) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  // Generate OTP, store pending info, don't create user yet
  await generateAndSendOTP(email, "register", {
    name,
    email,
    password: hashedPassword,
  });
  return { step: "otp", message: "OTP sent to your email", email };
}

async function loginUser(data) {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }
  // Store user ID for login
  await generateAndSendOTP(email, "login", { user });
  return { step: "otp", message: "OTP sent to your email", email };
}

async function verifyOtp(email, otp) {
  const record = otpStore.get(email);
  if (!record) {
    throw new Error("No pending request for this email or OTP expired");
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    throw new Error("OTP expired");
  }
  if (String(record.otp) !== String(otp)) {
    throw new Error("Incorrect OTP");
  }
  let verifiedUser;
  if (record.type === "register") {
    const { name, email: rawEmail, password } = record.data;
    const existing = await prisma.user.findUnique({
      where: { email: rawEmail },
    });
    if (existing) {
      throw new Error("User already exists");
    }
    verifiedUser = await prisma.user.create({
      data: {
        name,
        email: rawEmail,
        password,
      },
    });
  } else if (record.type === "login") {
    verifiedUser = record.data.user;
  }
  otpStore.delete(email);
  return verifiedUser;
}

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  generateAndSendOTP,
};