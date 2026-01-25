import { Resend } from 'resend';
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.SMTP_FROM_NAME} <onboarding@resend.dev>`,
      to: [to],
      subject: "Verify Your Account - RankArena",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering. Please use the verification code below to complete your sign-up:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return false;
    }

    console.log("Email sent successfully:", data.id);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};
