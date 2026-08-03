// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const { logAction } = require('../utils/logger');

// GET: Halaman Login
router.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  // BUG FIX: Gunakan res.locals yang sudah diset middleware global di app.js
  // Jangan panggil req.flash() lagi di sini — sudah dikonsumsi oleh middleware
  res.render('login', {
    error: res.locals.error,
    success: res.locals.success
  });
});

// POST: Autentikasi Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'Username atau password salah.');
      return res.redirect('/login');
    }

    // Cocokkan password dengan enkripsi SHA-256
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      req.flash('error', 'Username atau password salah.');
      return res.redirect('/login');
    }

    // Simpan ke Session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.name = user.name;

    await logAction(req, 'LOGIN', 'System', 'Berhasil masuk ke dalam sistem');

    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan sistem.');
    res.redirect('/login');
  }
});

// GET: Logout Sesi
router.get('/logout', async (req, res) => {
  await logAction(req, 'LOGOUT', 'System', 'Keluar dari sistem');
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
