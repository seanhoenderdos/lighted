/**
 * Email utility functions
 * Using Resend for email delivery
 */
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "noreply@yourdomain.com",
}: SendEmailParams): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      // Fall back to logging if no API key is configured
      console.info('---------- EMAIL NOT SENT (NO API KEY) ----------');
      console.info(`From: ${from}`);
      console.info(`To: ${to}`);
      console.info(`Subject: ${subject}`);
      console.info(`Body: ${html}`);
      console.info('-------------------------------');
      return true;
    }
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }
    
    console.info(`Email sent successfully to ${to}, ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const subject = "Reset Your Password";
  
  // HTML template for the email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p style="margin: 20px 0;">
        <a 
          href="${resetLink}" 
          style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;"
        >
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Thank you,<br>The Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
}