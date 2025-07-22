const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Package = require('../models/Package');

router.get('/', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visitorsToday = await Visitor.find({ date: { $gte: today } });
  const packagesToday = await Package.find({ date: { $gte: today } });

  const allVisitors = await Visitor.find().sort({ date: -1 });
  const allPackages = await Package.find().sort({ date: -1 });

  const date7DaysAgo = new Date();
  date7DaysAgo.setDate(today.getDate() - 6);

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

  // Gabungkan aktivitas hari ini (visitor & paket)
  const activitiesToday = [
    ...visitorsToday.map(v => ({
      type: 'visitor',
      name: v.name,
      purpose: v.purpose,
      date: v.date
    })),
    ...packagesToday.map(p => ({
      type: 'package',
      recipient: p.recipient,
      courier: p.courier,
      date: p.date
    }))
  ];

  // Urutkan berdasarkan waktu terbaru
  activitiesToday.sort((a, b) => b.date - a.date);

  // Ambil 5 aktivitas terbaru
  const recentActivities = activitiesToday.slice(0, 5);

  // Hitung awal bulan ini
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Visitor bulan ini
  const monthlyVisitors = await Visitor.countDocuments({ date: { $gte: startOfMonth } });

  // Paket bulan ini
  const monthlyPackages = await Package.countDocuments({ date: { $gte: startOfMonth } });

  const data = {
    visitorsToday,
    packagesToday,
    monthlyVisitors,
    monthlyPackages,
    chartLabels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    chartData,
    packageChartData: [0, 0, 0, 0, 0, 0, 0]
  };

  res.render('dashboard', {
    ...data,
    allVisitors,
    allPackages,
    recentActivities, // <-- tambahkan ini
    request: req
  });
});

module.exports = router;
