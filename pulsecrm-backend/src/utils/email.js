const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  console.log(`\n✉️ ----- OUTGOING EMAIL -----`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`HTML content:\n${html}`);
  console.log(`-----------------------------\n`);

  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes("your_email")) {
      console.warn("⚠️ Placeholder EMAIL_USER detected. Skipping SMTP send. Email logged to console.");
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent successfully via SMTP.");
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error.message);
    console.log("ℹ️ Skipping SMTP failure. Email logged to console above.");
  }
};

module.exports = {
  sendEmail,
};