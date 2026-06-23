const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px;">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password.</p>
    <p>Click the button below:</p>
    <a href="${resetLink}"
       style="display:inline-block; padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
       Reset Password
    </a>
    <p style="margin-top:20px;">This link expires in 15 minutes.</p>
    <p>If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Spend Matrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request',
    html,
  });
};

const sendWelcomeEmail = async (toEmail, name) => {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#0f0f0f; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a; border-radius:12px; border:1px solid #2a2a2a; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#4CAF50; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:1px;">💰 Spend-Matrix</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 12px; color:#ffffff; font-size:22px;">Welcome aboard, ${name}! 🎉</h2>
              <p style="margin:0 0 20px; color:#aaaaaa; font-size:15px; line-height:1.7;">
                Your Spend-Matrix account has been successfully created.<br/>
                You're all set to take control of your finances.
              </p>

              <table cellpadding="0" cellspacing="0" style="background:#242424; border-radius:8px; width:100%; margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px; color:#4CAF50; font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">What you can do</p>
                    <p style="margin:4px 0; color:#cccccc; font-size:14px;">✅ &nbsp;Track income &amp; expenses</p>
                    <p style="margin:4px 0; color:#cccccc; font-size:14px;">✅ &nbsp;Set and manage budgets</p>
                    <p style="margin:4px 0; color:#cccccc; font-size:14px;">✅ &nbsp;View analytics &amp; reports</p>
                    <p style="margin:4px 0; color:#cccccc; font-size:14px;">✅ &nbsp;Export your financial data</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px; color:#aaaaaa; font-size:14px; line-height:1.6;">
                If you have any questions, just reply to this email — we're always happy to help.
              </p>

              <p style="margin:0; color:#555555; font-size:13px;">— The Spend-Matrix Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; border-top:1px solid #2a2a2a; text-align:center;">
              <p style="margin:0; color:#444444; font-size:12px;">You're receiving this because you created a Spend-Matrix account.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Spend Matrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to Spend-Matrix 🎉',
    html,
  });
};

const sendLoginAlertEmail = async (toEmail, { ip, userAgent, time }) => {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px;">
    <h2>New Login Detected</h2>
    <p>We detected a login from a new device.</p>
    <ul>
      <li>IP Address: ${ip}</li>
      <li>Device: ${userAgent}</li>
      <li>Time: ${time}</li>
    </ul>
    <p>If this was not you, please reset your password immediately.</p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Spend Matrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'New Device Login Alert',
    html,
  });
};

const sendVerificationEmail = async (toEmail, token) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px;">
    <h2>Verify Your Email</h2>
    <p>Thank you for registering with Spend-Matrix. Please verify your email address to activate your account.</p>
    <a href="${verifyLink}"
       style="display:inline-block; padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
       Verify Email
    </a>
    <p style="margin-top:20px;">This link expires in 24 hours.</p>
    <p>If you didn't create an account, ignore this email.</p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Spend Matrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your Spend-Matrix email',
    html,
  });
};

const sendPasswordChangedEmail = async (toEmail, { ip, time }) => {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px;">
    <h2 style="color:#333;">Password Changed</h2>
    <p>Your Spend-Matrix account password was successfully changed.</p>
    <ul>
      <li>IP Address: ${ip}</li>
      <li>Time: ${time}</li>
    </ul>
    <p style="color:#e53e3e;">If you did not make this change, please reset your password immediately.</p>
    <a href="${process.env.FRONTEND_URL}/forgot-password"
       style="display:inline-block; padding:10px 20px; background:#e53e3e; color:white; text-decoration:none; border-radius:5px;">
       Secure My Account
    </a>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Spend Matrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Password Was Changed',
    html,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendLoginAlertEmail, sendVerificationEmail, sendPasswordChangedEmail };
