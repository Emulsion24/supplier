import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, // Your Hostinger Email
    pass: process.env.EMAIL_PASS, // Your Hostinger Password
  },
});