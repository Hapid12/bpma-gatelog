require('dotenv').config(); // tambahkan baris ini jika belum

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_GMAIL,
    pass: process.env.MY_GMAIL_PASS
  }
});

module.exports = transporter;
