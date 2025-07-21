const express = require('express');
const router = express.Router();
const multer = require('multer');
const Employee = require('../models/Employee');
const transporter = require('../utils/mailer'); // GANTI INI

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET form
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('package', { employees });
  } catch (err) {
    console.error('Gagal mengambil data karyawan:', err);
    res.status(500).send('Gagal mengambil data karyawan');
  }
});

// POST form + kirim email
router.post('/', upload.single('fotoPaket'), async (req, res) => {
  const { namaKurir, tujuanPaket, tipePaket, pengirim, perihal } = req.body;

  try {
    await transporter.sendMail({
      from: `"BPMA GATELOG" <${process.env.GMAIL_USER}>`,
      to: tujuanPaket,
      subject: `Paket Masuk untuk Anda dari ${namaKurir}`,
      html: `
        <h3>Informasi Paket</h3>
        <p><b>Nama Kurir:</b> ${namaKurir}</p>
        <p><b>Tipe Paket:</b> ${tipePaket}</p>
        <p><b>Pengirim:</b> ${pengirim}</p>
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
