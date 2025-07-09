const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

router.get('/', async (req, res) => {
  const visitors = await Visitor.find().sort({ date: -1 });
  res.render('visitor', { visitors });
});

router.post('/add', async (req, res) => {
  const { name, purpose } = req.body;
  await Visitor.create({ name, purpose });
  res.redirect('/visitor');
});

// form edit
router.get('/edit/:id', async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  res.render('editVisitor', { visitor });
});

router.post('/edit/:id', async (req, res) => {
  const { name, purpose } = req.body;
  await Visitor.findByIdAndUpdate(req.params.id, { name, purpose });
  res.redirect('/visitor');
});

router.post('/delete/:id', async (req, res) => {
  await Visitor.findByIdAndDelete(req.params.id);
  res.redirect('/visitor');
});


module.exports = router;
