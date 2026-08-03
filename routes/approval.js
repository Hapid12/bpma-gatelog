// routes/approval.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { requireLogin } = require('../utils/authMiddleware');
const { logAction } = require('../utils/logger');

// GET: Halaman approval dan check-in/out untuk Satpam
router.get('/', requireLogin, async (req, res) => {
  try {
    // Cari visitor dengan status disetujui, sedang berkunjung, atau selesai berkunjung
    const visitors = await Visitor.find({
      status: { $in: ['approved', 'checked-in', 'checked-out'] }
    }).sort({ date: -1 });

    res.render('approval', {
      visitors,
      user: req.session,
      request: req
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat data approval visitor');
  }
});

// POST: Aksi Check-In Visitor oleh Satpam
router.post('/checkin/:id', requireLogin, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, {
      status: 'checked-in',
      checkInTime: new Date()
    }, { new: true });
    if(visitor) await logAction(req, 'CHECK_IN', 'Visitor', `Melakukan check-in tamu: ${visitor.name}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// POST: Aksi Check-Out Visitor oleh Satpam
router.post('/checkout/:id', requireLogin, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, {
      status: 'checked-out',
      checkOutTime: new Date()
    }, { new: true });
    if(visitor) await logAction(req, 'CHECK_OUT', 'Visitor', `Melakukan check-out tamu: ${visitor.name}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// GET: Cetak Visitor Pass (Kartu Akses)
router.get('/pass/:id', requireLogin, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).send('Data visitor tidak ditemukan');
    
    res.render('visitorPass', {
      v: visitor
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat data visitor pass');
  }
});

module.exports = router;
