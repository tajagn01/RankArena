import nodemailer from "nodemailer";

// Create transporter - using Gmail SMTP (you can change to other providers)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"RankArena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your RankArena account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Welcome to RankArena!</h1>
        <p style="color: #666; font-size: 16px;">Hi ${name},</p>
        <p style="color: #666; font-size: 16px;">Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account with RankArena, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© RankArena - Track your LeetCode progress</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Resend verification email
export const resendVerificationEmail = async (email, code, name) => {
  return await sendVerificationEmail(email, code, name);
};
