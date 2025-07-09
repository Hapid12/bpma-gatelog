require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ✅ Tambahkan middleware agar 'request' tersedia di semua view
app.use((req, res, next) => {
  res.locals.request = req;
  next();
});

// Middleware lain
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routing
const visitorRoutes = require('./routes/visitor');
const packageRoutes = require('./routes/package');
const dashboardRoute = require('./routes/dashboard'); // ✅ Sudah benar

app.use('/visitor', visitorRoutes);
app.use('/package', packageRoutes);
app.use('/', dashboardRoute); // ✅ Root route diarahkan ke dashboard

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
