const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { requireAdmin } = require('../utils/authMiddleware');

// GET: Tampilkan halaman Audit Log
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Ambil log terbaru (maksimal 200 data terakhir agar tidak terlalu berat)
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);

    res.render('auditLog', {
      logs,
      user: req.session,
      request: req
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan memuat data Audit Log.');
  }
});

module.exports = router;
