const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { requireLogin, requireAdmin } = require('../utils/authMiddleware');
const { logAction } = require('../utils/logger');

// Helper hash password (sama dengan auth.js)
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

// ─────────────────────────────────────────
// GET: Halaman Pengaturan
// ─────────────────────────────────────────
router.get('/', requireLogin, async (req, res) => {
  try {
    const isAdmin = req.session.role === 'admin';
    let employees = [];
    let users = [];

    if (isAdmin) {
      employees = await Employee.find().sort({ name: 1 });
      users = await User.find().sort({ createdAt: -1 });
    }

    res.render('pengaturan', {
      employees,
      users,
      user: req.session,
      activeTab: isAdmin ? (req.query.tab || 'karyawan') : 'profil',
      request: req
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat halaman pengaturan.');
    res.redirect('/');
  }
});

// ─────────────────────────────────────────
// POST: Tambah Karyawan Baru
// ─────────────────────────────────────────
router.post('/karyawan/tambah', requireAdmin, async (req, res) => {
  try {
    const { name, email, position } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi.' });
    }

    // Cek duplikat email
    const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email karyawan sudah terdaftar.' });
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      position: position?.trim() || 'Staf'
    });

    await logAction(req, 'CREATE', 'Employee', `Menambah karyawan baru: ${employee.name} (${employee.email})`);

    res.json({ success: true, message: `Karyawan ${employee.name} berhasil ditambahkan.`, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menambah karyawan.' });
  }
});

// ─────────────────────────────────────────
// POST: Edit Karyawan
// ─────────────────────────────────────────
router.post('/karyawan/edit/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, position } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi.' });
    }

    // Cek duplikat email dari karyawan lain
    const duplicate = await Employee.findOne({ email: email.toLowerCase().trim(), _id: { $ne: req.params.id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan karyawan lain.' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), email: email.toLowerCase().trim(), position: position?.trim() || 'Staf' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan.' });
    }

    await logAction(req, 'UPDATE', 'Employee', `Mengubah data karyawan: ${employee.name} (${employee.email})`);

    res.json({ success: true, message: `Data ${employee.name} berhasil diperbarui.`, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengubah data karyawan.' });
  }
});

// ─────────────────────────────────────────
// DELETE: Hapus Karyawan
// ─────────────────────────────────────────
router.delete('/karyawan/hapus/:id', requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan.' });
    }

    await logAction(req, 'DELETE', 'Employee', `Menghapus karyawan: ${employee.name} (${employee.email})`);

    res.json({ success: true, message: `Karyawan ${employee.name} berhasil dihapus.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menghapus karyawan.' });
  }
});

// ─────────────────────────────────────────
// POST: Ganti Password
// ─────────────────────────────────────────
router.post('/profil/ganti-password', requireLogin, async (req, res) => {
  try {
    const { passwordLama, passwordBaru, konfirmasiPassword } = req.body;

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    if (passwordBaru !== konfirmasiPassword) {
      return res.status(400).json({ success: false, message: 'Password baru dan konfirmasi tidak sama.' });
    }

    if (passwordBaru.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    // Verifikasi password lama
    const hashedLama = hashPassword(passwordLama);
    if (user.password !== hashedLama) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    // Simpan password baru
    user.password = hashPassword(passwordBaru);
    await user.save();

    await logAction(req, 'UPDATE', 'System', `Mengganti password akun: ${user.username}`);

    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
  }
});

module.exports = router;
