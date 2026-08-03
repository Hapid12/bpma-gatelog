const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Package = require('../models/Package');

router.get('/', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Visitor hari ini
  const visitorsToday = await Visitor.find({ date: { $gte: today } });

  // Paket hari ini
  const packagesToday = await Package.find({ createdAt: { $gte: today } });

  // Visitor bulan ini
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyVisitors = await Visitor.countDocuments({ date: { $gte: startOfMonth } });

  // Paket bulan ini
  const monthlyPackages = await Package.countDocuments({ createdAt: { $gte: startOfMonth } });

  // Semua visitor dan paket untuk tabel
  const allVisitors = await Visitor.find().sort({ date: -1 });
  const allPackages = await Package.find().sort({ createdAt: -1 });

  // Hitung visitor per hari (7 hari terakhir)
  const date7DaysAgo = new Date();
  date7DaysAgo.setDate(date7DaysAgo.getDate() - 6);

  const visitorsLastWeek = await Visitor.find({ date: { $gte: date7DaysAgo } });

  const dailyCounts = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
  }

  visitorsLastWeek.forEach(v => {
    const dateStr = new Date(v.date).toISOString().split('T')[0];
    if (dailyCounts[dateStr] !== undefined) {
      dailyCounts[dateStr]++;
    }
  });

  const chartLabels = Object.keys(dailyCounts);
  const chartData = Object.values(dailyCounts);

  // Hitung paket per hari (7 hari terakhir)
  const packagesLastWeek = await Package.find({ createdAt: { $gte: date7DaysAgo } });

  const packageDailyCounts = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    packageDailyCounts[dateStr] = 0;
  }

  packagesLastWeek.forEach(p => {
    const dateStr = new Date(p.createdAt).toISOString().split('T')[0];
    if (packageDailyCounts[dateStr] !== undefined) {
      packageDailyCounts[dateStr]++;
    }
  });

  const packageChartData = Object.values(packageDailyCounts);

  // Ambil 10 aktivitas terbaru dari visitor dan paket
  const recentVisitors = await Visitor.find().sort({ date: -1 }).limit(5);
  const recentPackages = await Package.find().sort({ createdAt: -1 }).limit(5);

  const recentActivities = [
    ...recentVisitors.map(v => ({
        type: 'visitor',
        name: v.name,
        purpose: v.purpose,
        date: v.date
    })),
    ...recentPackages.map(p => ({
        type: 'package',
        recipient: p.penerimaNama,
        courier: p.namaKurir,
        date: p.createdAt
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const data = {
    visitorsToday,
    packagesToday,
    monthlyVisitors,
    monthlyPackages,
    chartLabels,
    chartData,
    packageChartData
  };

  res.render('dashboard', {
    ...data,
    allVisitors,
    allPackages,
    recentActivities,
    user: req.session, // Data session user (role, name, username)
    request: req
  });
});

module.exports = router;
