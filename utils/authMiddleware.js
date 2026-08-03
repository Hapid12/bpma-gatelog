// utils/authMiddleware.js

// Memastikan user sudah login
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash('error', 'Silakan login terlebih dahulu.');
    return res.redirect('/login');
  }
  next();
};

// Memastikan user memiliki role Admin
const requireAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    req.flash('error', 'Akses ditolak. Rute ini hanya untuk Admin.');
    return res.redirect('/');
  }
  next();
};

// Memastikan user memiliki role Satpam
const requireSatpam = (req, res, next) => {
  if (req.session.role !== 'satpam') {
    req.flash('error', 'Akses ditolak. Rute ini hanya untuk Satpam.');
    return res.redirect('/');
  }
  next();
};

module.exports = {
  requireLogin,
  requireAdmin,
  requireSatpam
};
