import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_EMAIL_HOST,
  port: parseInt(process.env.SMTP_EMAIL_PORT),
  secure: false,
  service:'gmail',
  auth: {
    user: process.env.SMTP_EMAIL_USER,
    pass: process.env.SMTP_EMAIL_PASS,
  },
});

export default transporter;
