// routes/visitor.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Employee = require('../models/Employee');
const transporter = require('../utils/mailer');

// GET: Halaman visitor
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

// POST: Form visitor (dari form action="/visitor")
router.post('/', async (req, res) => {
  try {
    const {
      nama,
      email,
      instansi,
      bertemu,
      janji,
      keperluan,
      rekan,
      tanggal
    } = req.body;

    // Cari email karyawan berdasarkan nama
    const employee = await Employee.findOne({ name: bertemu });
    if (!employee) {
      return res.status(404).send('Karyawan tidak ditemukan.');
    }

    const newVisitor = await Visitor.create({
      name: nama,
      email: email,
      institution: instansi,
      targetEmployee: bertemu,
      hasAppointment: janji,
      purpose: keperluan,
      companions: rekan,
      schedule: new Date(tanggal),
      date: new Date()
    });

    // Kirim email ke karyawan
    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: employee.email,
      subject: `Permintaan Pertemuan dari ${nama}`,
      html: `
        <p>Yth. Bapak/Ibu <b>${bertemu}</b>,</p>
        <p>Anda memiliki permintaan pertemuan dari:</p>
        <ul>
          <li><b>Nama:</b> ${nama}</li>
          <li><b>Instansi:</b> ${instansi}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Keperluan:</b> ${keperluan}</li>
          <li><b>Jumlah Rekan:</b> ${rekan}</li>
          <li><b>Jadwal:</b> ${new Date(tanggal).toLocaleString('id-ID')}</li>
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
router.post('/', async (req, res) => {
  try {
    console.log('Data masuk:', req.body); // debug 1

    const {
      nama,
      email,
      instansi,
      bertemu,
      janji,
      keperluan,
      rekan,
      tanggal
    } = req.body;

    // lanjut...


    await Visitor.findByIdAndUpdate(req.params.id, {
      name: nama,
      email: email,
      institution: instansi,
      targetEmployee: bertemu,
      hasAppointment: janji,
      purpose: keperluan,
      companions: rekan,
      schedule: new Date(tanggal)
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
