const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

router.get('/', async (req, res) => {
  const packages = await Package.find().sort({ date: -1 });
  res.render('package', { packages });
});

router.post('/add', async (req, res) => {
  const { recipient, courier } = req.body;
  await Package.create({ recipient, courier });
  res.redirect('/package');
});

// GET form edit
router.get('/edit/:id', async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  res.render('editPackage', { pkg });
});

// POST simpan hasil edit
router.post('/edit/:id', async (req, res) => {
  const { recipient, courier } = req.body;
  await Package.findByIdAndUpdate(req.params.id, { recipient, courier });
  res.redirect('/package');
});

// POST hapus paket
router.post('/delete/:id', async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.redirect('/package');
});

module.exports = router;
