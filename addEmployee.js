// addEmployee.js
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');

    await Employee.create([
      { name: 'haykal', email: 'muhammadhafizhhaykal01@gmail.com' },
      { name: 'Siti Aminah', email: 'siti.aminah@example.com' },
      { name: 'Dian Pratama', email: 'dian.pratama@example.com' },
    ]);

    console.log('Data employee berhasil ditambahkan.');
    mongoose.disconnect();
  })
  .catch(err => console.error('Gagal konek MongoDB:', err));
