const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Package = require('../models/Package');

router.get('/', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visitorsToday = await Visitor.find({ date: { $gte: today } });
  const packagesToday = await Package.find({ date: { $gte: today } });

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

  // Initialize default data
  const data = {
    visitorsToday,
    packagesToday,
    monthlyVisitors: 0,
    monthlyPackages: 0,
    chartLabels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    chartData,
    packageChartData: [0, 0, 0, 0, 0, 0, 0]
  };

  res.render('dashboard', {
    ...data,
    request: req
  });
});

module.exports = router;
