// routes/package.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');
dotenv.config();

// Ambil data karyawan untuk dropdown dan tampilkan form
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('package', { employees });
  } catch (err) {
    res.status(500).send('Gagal mengambil data karyawan');
  }
});

router.post('/', async (req, res) => {
  const { namaKurir, tujuanPaket, tipePaket, pengirim, perihal } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"BPMA GATELOG" <${process.env.GMAIL_USER}>`,
      to: tujuanPaket,
      subject: `Paket Masuk untuk Anda dari ${namaKurir}`,
      html: `
        <h3>Informasi Paket</h3>
        <p><b>Nama Kurir:</b> ${namaKurir}</p>
        <p><b>Tipe Paket:</b> ${tipePaket}</p>
        <p><b>Pengirim:</b> ${pengirim}</p>
        <p><b>Perihal:</b> ${perihal}</p>
        <br>
        <p>Silakan ambil paket Anda di pos keamanan.</p>
      `
    });

    res.send('Berhasil mengirim email notifikasi paket!');
  } catch (error) {
    console.error('Gagal kirim email:', error);
    res.status(500).send('Gagal mengirim email notifikasi.');
  }
});

module.exports = router;
