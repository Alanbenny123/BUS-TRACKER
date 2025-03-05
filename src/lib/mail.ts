import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Boolean(process.env.SMTP_SECURE), // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  debug: true, // Show debug output
  logger: true // Log information into console
});

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

interface EmailError {
  message: string;
  code?: string;
  command?: string;
  response?: string;
}

export async function sendMail({ to, subject, html }: SendMailProps) {
  try {
    // Verify SMTP connection configuration
    console.log('Verifying SMTP connection...');
    const verification = await transporter.verify();
    console.log('SMTP Connection verified:', verification);

    // Log email configuration (without sensitive data)
    console.log('Attempting to send email with config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      auth: {
        user: process.env.SMTP_USER,
        // Not logging password for security
      }
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    
    return { success: true };
  } catch (error) {
    // Enhanced error logging
    const emailError = error as EmailError;
    console.error('Detailed email error:', {
      error: emailError.message,
      code: emailError.code,
      command: emailError.command,
      response: emailError.response,
      stack: (error as Error).stack, // Add stack trace
    });

    // Log environment variables (without sensitive data)
    console.log('Environment variables check:', {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_SECURE: !!process.env.SMTP_SECURE,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      SMTP_FROM_NAME: !!process.env.SMTP_FROM_NAME,
      SMTP_FROM_EMAIL: !!process.env.SMTP_FROM_EMAIL,
    });

    return { success: false, error: emailError };
  }
}

export function generatePasswordResetEmail(resetToken: string) {
  // Ensure we have the base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Construct the reset URL ensuring no double slashes
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;
  
  // Log the generated URL for debugging
  console.log('Generated reset URL:', resetUrl);

  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #4F46E5; margin-bottom: 20px;">Reset Your Password</h2>
      <p style="margin-bottom: 20px; line-height: 1.5;">
        You are receiving this email because you (or someone else) requested a password reset.
        Click the button below to reset your password. This link will expire in 1 hour.
      </p>
      <a 
        href="${resetUrl}"
        style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-bottom: 20px;"
      >
        Reset Password
      </a>
      <p style="margin-bottom: 20px; line-height: 1.5;">
        If you did not request this password reset, please ignore this email and your password will remain unchanged.
      </p>
      <p style="color: #6B7280; font-size: 14px;">
        If the button above doesn't work, copy and paste this URL into your browser:<br>
        <a href="${resetUrl}" style="color: #4F46E5; text-decoration: none;">${resetUrl}</a>
      </p>
    </div>
  `;
} 