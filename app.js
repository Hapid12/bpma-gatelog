require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const crypto = require('crypto');

const visitorRoutes = require('./routes/visitor');
const packageRoutes = require('./routes/package');
const dashboardRoute = require('./routes/dashboard');
const responseRoutes = require('./routes/response');
const authRoutes = require('./routes/auth');
const approvalRoutes = require('./routes/approval');
const appointmentRoutes = require('./routes/appointment');
const laporanRoutes = require('./routes/laporan');
const auditLogRoutes = require('./routes/auditLog');
const pengaturanRoutes = require('./routes/pengaturan');

const { requireLogin } = require('./utils/authMiddleware');
const User = require('./models/User');

const app = express();

// 🔧 Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 📦 Middleware: Parsing Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Static Files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// 💬 Session & Flash Message
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// 📣 Flash Messages available in views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// 🌐 Routes

// Rute Auth (Login / Logout) - Tanpa proteksi middleware
app.use('/', authRoutes);

// Rute Response (Approval via email link) - Tanpa proteksi middleware
app.use('/response', responseRoutes);

// Proteksi rute berikut dengan middleware requireLogin (kecuali form visitor/package yang dibuat publik)
app.use('/visitor', visitorRoutes);
app.use('/package', packageRoutes);
app.use('/approval', requireLogin, approvalRoutes);
app.use('/appointment', requireLogin, appointmentRoutes);
app.use('/laporan', requireLogin, laporanRoutes);
app.use('/audit-log', requireLogin, auditLogRoutes);
app.use('/pengaturan', requireLogin, pengaturanRoutes);
app.use('/', requireLogin, dashboardRoute);

// 🌱 Auto-Seeding: Buat akun default Admin & Satpam jika belum ada
async function seedDefaultUsers() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        name: 'Administrator'
      });
      console.log('✅ Default admin account created (admin / admin123)');
    }

    const satpamExists = await User.findOne({ username: 'satpam' });
    if (!satpamExists) {
      const hashedPassword = crypto.createHash('sha256').update('satpam123').digest('hex');
      await User.create({
        username: 'satpam',
        password: hashedPassword,
        role: 'satpam',
        name: 'Satpam BPMA'
      });
      console.log('✅ Default satpam account created (satpam / satpam123)');
    }
  } catch (err) {
    console.error('❌ Error seeding default users:', err);
  }
}

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedDefaultUsers();
});
