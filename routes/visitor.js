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
    const employeeName = bertemu.split(' - ')[0]; // hanya ambil nama
    const employee = await Employee.findOne({ name: employeeName });
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
      companions: Number(rekan),
      schedule: new Date(tanggal),
      date: new Date()
    });

    const mailOptions = {
  from: process.env.MY_GMAIL,
  to: employee.email,
  subject: `Permintaan Pertemuan dari ${nama}`,
  replyTo: email,
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; text-align: center;">
    
    <!-- Card Container -->
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
      
      <!-- Icon Visitor -->
      <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" 
           alt="Visitor Icon" 
           style="width: 80px; height: 80px; margin-bottom: 20px;" />

      <!-- Title -->
      <h2 style="color: #333; margin-bottom: 10px;">Permintaan Pertemuan</h2>
      <p style="color: #666; margin-bottom: 20px;">Yth. Bapak/Ibu <b>${bertemu}</b></p>

      <!-- Detail Data -->
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 25px;">
        <tr><td><b>Nama</b></td><td>: ${nama}</td></tr>
        <tr><td><b>NIK</b></td><td>: ${nik || 'Tidak ada NIK'}</td></tr>
        <tr><td><b>Instansi</b></td><td>: ${instansi}</td></tr>
        <tr><td><b>Email</b></td><td>: ${email}</td></tr>
        <tr><td><b>Keperluan</b></td><td>: ${keperluan}</td></tr>
        <tr><td><b>Jumlah Rekan</b></td><td>: ${rekan}</td></tr>
        <tr><td><b>Jadwal</b></td><td>: ${new Date(tanggal).toLocaleString('id-ID')}</td></tr>
      </table>

      <!-- Buttons -->
      <div style="margin-top: 20px;">
        <a href="http://localhost:3000/response/approved/${newVisitor._id}" 
           style="background: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 0 5px;">✅ Approve</a>
        
        <a href="http://localhost:3000/response/rejected/${newVisitor._id}" 
           style="background: #f44336; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 0 5px;">❌ Reject</a>
        
        <a href="http://localhost:3000/response/reschedule/${newVisitor._id}" 
           style="background: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 0 5px;">📆 Reschedule</a>
      </div>
      
      <p style="margin-top: 30px; color: #777; font-size: 12px;">Terima kasih atas perhatian Anda.</p>
    </div>
  </div>
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
  const visitor = await Visitor.findById(req.params.id);
  const employees = await Employee.find();
  res.render('editVisitor', { visitor, employees });
});

// Edit Visitor
router.post('/edit/:id', async (req, res) => {
  try {
    await Visitor.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete Visitor
router.post('/delete/:id', async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});



module.exports = router;
