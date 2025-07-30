const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const transporter = require('../utils/mailer');

// APPROVED
router.get('/approved/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error',
      title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Permintaan Anda telah di-approve oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.render('status', {
      status: 'approved',
      title: 'Permintaan Di-approve',
      message: `notifikasi telah dikirim ke email visitor.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error',
      title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

// REJECTED
router.get('/rejected/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error',
      title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Maaf, permintaan Anda telah ditolak oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.render('status', {
      status: 'rejected',
      title: 'Permintaan Ditolak',
      message: `notifikasi telah dikirim ke email visitor.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error',
      title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

// RESCHEDULE
router.get('/reschedule/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'reschedule' }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error',
      title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Permintaan Anda perlu dijadwalkan ulang oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.render('status', {
      status: 'reschedule',
      title: 'Perlu Penjadwalan Ulang',
      message: `notifikasi telah dikirim ke email visitor.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error',
      title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

module.exports = router;
