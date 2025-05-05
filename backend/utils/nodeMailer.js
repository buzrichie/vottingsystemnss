"use strict";
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
  logger: true,
  debug: false,
  tls: {
    rejectUnauthorized: false,
  },
});

const mailer = async (from, to, subject, text, html = "") => {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send to ${to}:`, error.message);
  }
};

module.exports = { mailer };
