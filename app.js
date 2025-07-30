require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const visitorRoutes = require('./routes/visitor');
const packageRoutes = require('./routes/package');
const dashboardRoute = require('./routes/dashboard');
const responseRoutes = require('./routes/response');

const app = express();

// 🔧 Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 📦 Middleware: Parsing Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Static Files
app.use(express.static(path.join(__dirname, 'public')));
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
app.use('/visitor', visitorRoutes);
app.use('/package', packageRoutes);
app.use('/response', responseRoutes);
app.use('/', dashboardRoute);

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
