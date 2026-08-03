const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Package = require('../models/Package');
const { requireAdmin } = require('../utils/authMiddleware');

// Helper function untuk memfilter berdasarkan bulan (format YYYY-MM)
const getMonthDateRange = (monthStr) => {
  let date;
  if (monthStr) {
    // monthStr contoh: "2026-06"
    date = new Date(`${monthStr}-01`);
  } else {
    date = new Date();
  }
  
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startOfMonth, endOfMonth, selectedMonth: date };
};

// GET: Tampilkan halaman preview laporan
router.get('/', requireAdmin, async (req, res) => {
  try {
    const monthQuery = req.query.month; // YYYY-MM
    const { startOfMonth, endOfMonth, selectedMonth } = getMonthDateRange(monthQuery);

    const visitors = await Visitor.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    const packages = await Package.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: 1 });

    // Formatting bulan untuk dikembalikan ke form (YYYY-MM)
    const monthFormat = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;

    res.render('laporan', {
      visitors,
      packages,
      monthQuery: monthFormat,
      selectedMonth,
      user: req.session,
      request: req
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat data laporan');
  }
});

// GET: Halaman Cetak Laporan (Template resmi untuk PDF)
router.get('/cetak', requireAdmin, async (req, res) => {
  try {
    const monthQuery = req.query.month;
    const { startOfMonth, endOfMonth, selectedMonth } = getMonthDateRange(monthQuery);

    // Ambil data yang disetujui atau pernah datang (tergantung kebutuhan, di sini kita cetak semua yang ada di bulan itu)
    const visitors = await Visitor.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    const packages = await Package.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: 1 });

    res.render('laporanCetak', {
      visitors,
      packages,
      selectedMonth,
      user: req.session
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat halaman cetak');
  }
});

module.exports = router;
