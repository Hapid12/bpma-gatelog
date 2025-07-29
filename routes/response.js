const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const transporter = require('../utils/mailer');

// APPROVED
router.get('/approved/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!visitor) return res.status(404).send('Visitor tidak ditemukan');

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Permintaan Anda telah di-approve oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.send('Permintaan telah di-approve dan visitor sudah diberi notifikasi.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat memproses permintaan.');
  }
});

// REJECTED
router.get('/rejected/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!visitor) return res.status(404).send('Visitor tidak ditemukan');

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Maaf, permintaan Anda telah ditolak oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.send('Permintaan telah ditolak dan visitor sudah diberi notifikasi.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat memproses permintaan.');
  }
});

// RESCHEDULE
router.get('/reschedule/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'reschedule' }, { new: true });
    if (!visitor) return res.status(404).send('Visitor tidak ditemukan');

    await transporter.sendMail({
      to: visitor.email,
      subject: 'Status Permintaan Anda',
      html: `<p>Permintaan Anda perlu dijadwalkan ulang oleh ${visitor.targetEmployee}.</p>`,
      replyTo: visitor.email
    });

    res.send('Permintaan perlu dijadwalkan ulang dan visitor sudah diberi notifikasi.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat memproses permintaan.');
  }
});

module.exports = router;
