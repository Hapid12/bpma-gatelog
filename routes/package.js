const express = require('express');
const router = express.Router();
const multer = require('multer');
const Employee = require('../models/Employee');
const Package = require('../models/Package');
const transporter = require('../utils/mailer');

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
    const packages = await Package.find().sort({ date: -1 }); // ambil data paket untuk tabel
    res.render('package', { employees, packages });
  } catch (err) {
    console.error('Gagal mengambil data karyawan/paket:', err);
    res.status(500).send('Gagal mengambil data karyawan/paket');
  }
});

// POST form + kirim email
router.post('/', upload.single('fotoPaket'), async (req, res) => {
  const {
    nomorResi,
    tipePaket,
    deskripsiPaket,
    namaKurir,
    emailKurir,
    nomorHpKurir,
    pengirim,
    tujuanPaket // ini adalah _id karyawan
  } = req.body;

  try {
    // Ambil data karyawan berdasarkan ID
    const employee = await Employee.findById(tujuanPaket);
    if (!employee) throw new Error('Karyawan tidak ditemukan');

    // Simpan data paket ke database, sertakan nama karyawan
    await Package.create({
      nomorResi,
      tipePaket,
      deskripsiPaket,
      namaKurir,
      emailKurir,
      nomorHpKurir,
      pengirim,
      penerimaNama: employee.name, // <-- ini yang akan tampil di dashboard
      penerimaEmail: employee.email,
      fotoPaket: req.file ? req.file.filename : null,
      createdAt: new Date()
    });

    // Kirim email ke karyawan
    await transporter.sendMail({
      from: `"BPMA GATELOG" <${process.env.GMAIL_USER}>`,
      to: employee.email,
      subject: `Paket Masuk untuk Anda dari ${namaKurir}`,
      html: `
        <h3>Informasi Paket</h3>
        <p><b>Nomor Resi:</b> ${nomorResi}</p>
        <p><b>Jenis Paket:</b> ${tipePaket}</p>
        <p><b>Deskripsi:</b> ${deskripsiPaket || '-'}</p>
        <p><b>Nama Kurir:</b> ${namaKurir}</p>
        <p><b>Email Kurir:</b> ${emailKurir}</p>
        <p><b>Nomor HP Kurir:</b> ${nomorHpKurir}</p>
        <p><b>Pengirim:</b> ${pengirim}</p>
        <br>
        <p>Silakan ambil paket Anda di pos keamanan.</p>
      `,
      attachments: req.file ? [{
        filename: req.file.originalname,
        path: req.file.path
      }] : []
    });

    res.redirect('/package');
  } catch (error) {
    console.error('Gagal kirim email atau simpan data:', error);
    res.status(500).send('Gagal mengirim email atau simpan data paket.');
  }
});

// Edit Package
router.post('/edit/:id', async (req, res) => {
  try {
    await Package.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete Package
router.post('/delete/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
