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
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('visitor', {
      visitors,
      employees,
      successMessage,
      errorMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat data visitor');
  }
});

// POST: Form visitor
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
      tanggal,
      nik
    } = req.body;

    // Cari email karyawan
    const employee = await Employee.findOne({ name: bertemu });
    if (!employee) {
      req.flash('error', 'Karyawan tidak ditemukan.');
      return res.redirect('/visitor');
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

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: employee.email,
      subject: `Permintaan Pertemuan dari ${nama}`,
      replyTo: email,
      html: `
        <p>Yth. Bapak/Ibu <b>${bertemu}</b>,</p>
        <p>Anda memiliki permintaan pertemuan dari:</p>
        <ul>
          <li><b>Nama:</b> ${nama}</li>
          <li><b>NIK:</b> ${nik || 'Tidak ada NIK'}</li>
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

    req.flash('success', 'Data berhasil dikirim dan email telah dikirim ke karyawan.');
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal menyimpan data visitor.');
    res.redirect('/visitor');
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
      nama,
      email,
      instansi,
      bertemu,
      janji,
      keperluan,
      rekan,
      tanggal
    } = req.body;

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

    req.flash('success', 'Data visitor berhasil diperbarui.');
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memperbarui data visitor.');
    res.redirect('/visitor');
  }
});

// POST: Hapus visitor
router.post('/delete/:id', async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    req.flash('success', 'Data visitor berhasil dihapus.');
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal menghapus data visitor.');
    res.redirect('/visitor');
  }
});

module.exports = router;
