require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// ⬇️ Tambahkan ini ke bagian atas sebelum digunakan
const visitorRoutes = require('./routes/visitor');
const packageRoutes = require('./routes/package');
const dashboardRoute = require('./routes/dashboard');

const app = express();

// Middleware
app.use((req, res, next) => {
  res.locals.request = req;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routing (pindahkan ke bawah setelah semua require)
app.use('/visitor', visitorRoutes);
app.use('/package', packageRoutes);
app.use('/', dashboardRoute);

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
