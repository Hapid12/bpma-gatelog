// routes/visitor.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Employee = require('../models/Employee');
const transporter = require('../utils/mailer');

// GET: Halaman visitor + histori
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ date: -1 });
    const employees = await Employee.find();
    res.render('visitor', { visitors, employees });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat data visitor');
  }
});

// POST: Tambah visitor
router.post('/add', async (req, res) => {
  try {
    const {
      name,
      email,
      institution,
      targetEmployee,
      hasAppointment,
      purpose,
      companions,
      schedule
    } = req.body;

    // Cari email karyawan berdasarkan nama
    const employee = await Employee.findOne({ name: targetEmployee });
    if (!employee) {
      return res.status(404).send('Karyawan tidak ditemukan.');
    }

    const newVisitor = await Visitor.create({
      name,
      email,
      institution,
      targetEmployee,
      hasAppointment,
      purpose,
      companions,
      schedule: new Date(schedule),
      date: new Date()
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: employee.email,
      subject: `Permintaan Pertemuan dari ${name}`,
      html: `
        <p>Yth. Bapak/Ibu <b>${targetEmployee}</b>,</p>
        <p>Anda memiliki permintaan pertemuan dari:</p>
        <ul>
          <li><b>Nama:</b> ${name}</li>
          <li><b>Instansi:</b> ${institution}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Keperluan:</b> ${purpose}</li>
          <li><b>Jumlah Rekan:</b> ${companions}</li>
          <li><b>Jadwal:</b> ${new Date(schedule).toLocaleString('id-ID')}</li>
        </ul>
        <p>Apakah Anda bersedia menerima tamu ini?</p>
        <p>
          <a href="http://localhost:3000/response/approved/${newVisitor._id}">✅ Approve</a> |
          <a href="http://localhost:3000/response/rejected/${newVisitor._id}">❌ Reject</a> |
          <a href="http://localhost:3000/response/reschedule/${newVisitor._id}">📆 Reschedule</a>
        </p>
        <p>Terima kasih.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email terkirim ke ${employee.email}`);
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menyimpan data visitor');
  }
});

// GET: Form edit visitor
router.get('/edit/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    res.render('editVisitor', { visitor });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat form edit visitor');
  }
});

// POST: Update visitor
router.post('/edit/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      institution,
      targetEmployee,
      hasAppointment,
      purpose,
      companions,
      schedule
    } = req.body;

    await Visitor.findByIdAndUpdate(req.params.id, {
      name,
      email,
      institution,
      targetEmployee,
      hasAppointment,
      purpose,
      companions,
      schedule: new Date(schedule)
    });

    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengupdate data visitor');
  }
});

// POST: Hapus visitor
router.post('/delete/:id', async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menghapus data visitor');
  }
});

module.exports = router;
