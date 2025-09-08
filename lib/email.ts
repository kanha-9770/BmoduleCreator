import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (
  email: string,
  otp: string,
  purpose: "registration" | "login" | "password_reset"
): Promise<boolean> => {
  try {
    console.log("Preparing to send OTP email:", { email, otp, purpose });

    const transporter = createTransporter();
    const subject = getEmailSubject(purpose);
    const htmlContent = getEmailTemplate(otp, purpose);

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
    });
    return false;
  }
};

// Get email subject based on purpose
const getEmailSubject = (
  purpose: "registration" | "login" | "password_reset"
): string => {
  switch (purpose) {
    case "registration":
      return "Verify Your Account - OTP Code";
    case "login":
      return "Login Verification - OTP Code";
    case "password_reset":
      return "Password Reset - OTP Code";
    default:
      return "Verification Code";
  }
};

// Email template
const getEmailTemplate = (
  otp: string,
  purpose: "registration" | "login" | "password_reset"
): string => {
  const purposeText = {
    registration: "complete your account registration",
    login: "sign in to your account",
    password_reset: "reset your password",
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 12px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #3b82f6;
                text-align: center;
                background: #eff6ff;
                padding: 20px;
                border-radius: 8px;
                letter-spacing: 4px;
                margin: 30px 0;
                border: 2px dashed #3b82f6;
            }
            .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #92400e;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔐</div>
                <h1 style="color: #1f2937; margin: 0;">Verification Code</h1>
                <p style="color: #6b7280; margin: 10px 0 0 0;">
                    Use this code to ${purposeText[purpose]}
                </p>
            </div>
            
            <div class="otp-code">
                ${otp}
            </div>
            
            <p style="text-align: center; color: #374151;">
                Enter this 6-digit code to continue. This code will expire in <strong>5 minutes</strong>.
            </p>
            
            <div class="warning">
                <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            
            <div class="footer">
                <p>If you didn't request this code, please ignore this email.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Verify email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send welcome email after successful registration
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  try {
    console.log("Preparing to send welcome email:", { email, firstName });

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to Our Platform! 🎉",
      html: getWelcomeEmailTemplate(firstName),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", result.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
    });
    return false;
  }
};

const getWelcomeEmailTemplate = (firstName: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 12px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎉</div>
                <h1 style="color: #1f2937; margin: 0;">Welcome, ${firstName}!</h1>
                <p style="color: #6b7280; margin: 10px 0 0 0;">
                    Your account has been successfully created
                </p>
            </div>
            
            <p>Thank you for joining our platform! We're excited to have you on board.</p>
            
            <p>You can now:</p>
            <ul>
                <li>Access your dashboard</li>
                <li>Manage your profile</li>
                <li>Explore all features</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}" class="cta-button">
                    Get Started
                </a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p>Thank you for choosing our platform!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
