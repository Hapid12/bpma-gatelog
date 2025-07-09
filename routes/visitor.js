// routes/visitor.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// GET: Halaman visitor + histori
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ date: -1 });
    res.render('visitor', { visitors });
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

    const newVisitor = new Visitor({
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

    await newVisitor.save();
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
