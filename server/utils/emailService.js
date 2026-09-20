const nodemailer = require('nodemailer');

const createEmailTransporter = () => {
  const user = process.env.EMAIL_USER || 'vallabhdharejiya9@gmail.com';
  const pass = (process.env.EMAIL_PASS || 'kqytlsesguipdfut').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send 6-Digit OTP Email for First-Time Login / Email Verification
 */
const sendOtpEmail = async ({ toEmail, userName, otp, expiresInMinutes = 10 }) => {
  const transporter = createEmailTransporter();
  const senderAddress = process.env.EMAIL_FROM || `"Parivartan Hostel" <${process.env.EMAIL_USER || 'vallabhdharejiya9@gmail.com'}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Email Verification - Parivartan Hostel</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f6f9;
          margin: 0;
          padding: 20px;
          color: #1e293b;
        }
        .container {
          max-width: 540px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
          color: #ffffff;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #c7d2fe;
          font-weight: 500;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .description {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .otp-box {
          background: #f8fafc;
          border: 2px dashed #6366f1;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 900;
          color: #1e1b4b;
          letter-spacing: 8px;
          margin: 4px 0;
        }
        .otp-expiry {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
        }
        .security-notice {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 12px;
          color: #991b1b;
          line-height: 1.5;
          margin-top: 24px;
        }
        .footer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 20px 24px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Parivartan Hostel</h1>
          <p>Hostel Management Portal • Account Verification</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${userName || 'User'},</div>
          <div class="description">
            Please use the 6-digit verification code below to verify your email and activate your <strong>Parivartan Hostel</strong> account for first-time login:
          </div>

          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ Valid for <strong>${expiresInMinutes} minutes</strong></div>
          </div>

          <div class="security-notice">
            <strong>Security Notice:</strong> Never share this code with anyone. Once verified, you will be able to sign in directly with your password.
          </div>
        </div>

        <div class="footer">
          <strong>Parivartan Hostel</strong><br/>
          80 Foot Road, Near Desal Bhagat Ni Vav, Patel Boarding<br/>
          Surendranagar – 363001, Gujarat, India<br/>
          Support Contact: +91 99799 99228 • vallabhdharejiya9@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: senderAddress,
    to: toEmail,
    subject: `🔐 ${otp} is your Parivartan Hostel verification code`,
    text: `Your Parivartan Hostel verification code is: ${otp}. It will expire in ${expiresInMinutes} minutes. Do not share this code with anyone.`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Send 6-Digit OTP Email for Password Reset
 */
const sendPasswordResetEmail = async ({ toEmail, userName, otp, expiresInMinutes = 10 }) => {
  const transporter = createEmailTransporter();
  const senderAddress = process.env.EMAIL_FROM || `"Parivartan Hostel" <${process.env.EMAIL_USER || 'vallabhdharejiya9@gmail.com'}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Your Password - Parivartan Hostel</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f6f9;
          margin: 0;
          padding: 20px;
          color: #1e293b;
        }
        .container {
          max-width: 540px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #ffffff;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .description {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .otp-box {
          background: #f8fafc;
          border: 2px dashed #f59e0b;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 700;
          color: #d97706;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 8px;
          margin: 4px 0;
        }
        .otp-expiry {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
        }
        .security-notice {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 12px;
          color: #92400e;
          line-height: 1.5;
          margin-top: 24px;
        }
        .footer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 20px 24px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Parivartan Hostel</h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${userName || 'User'},</div>
          <div class="description">
            We received a request to reset your password for the <strong>Parivartan Hostel</strong> portal. Enter the 6-digit code below to set a new password:
          </div>

          <div class="otp-box">
            <div class="otp-label">Password Reset Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ Valid for <strong>${expiresInMinutes} minutes</strong></div>
          </div>

          <div class="security-notice">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or notify administration if you suspect unauthorized activity.
          </div>
        </div>

        <div class="footer">
          <strong>Parivartan Hostel</strong><br/>
          80 Foot Road, Near Desal Bhagat Ni Vav, Patel Boarding<br/>
          Surendranagar – 363001, Gujarat, India<br/>
          Support Contact: +91 99799 99228 • vallabhdharejiya9@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: senderAddress,
    to: toEmail,
    subject: `🔑 ${otp} is your password reset code - Parivartan Hostel`,
    text: `Your Parivartan Hostel password reset code is: ${otp}. It will expire in ${expiresInMinutes} minutes. Do not share this code with anyone.`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  createEmailTransporter,
};
