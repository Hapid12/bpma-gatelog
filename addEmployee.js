// addEmployee.js
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    console.log('Mengapus data karyawan lama...');
    await Employee.deleteMany({});

    console.log('Memasukkan data karyawan baru...');
    await Employee.create([
      { name: 'Haykal', email: 'muhammadhafizhhaykal01@gmail.com', position: 'IT Support' },
      { name: 'Hafizh', email: 'bintangpia28@gmail.com', position: 'IT Support' },
    ]);

    console.log('Data employee berhasil ditambahkan.');
    mongoose.disconnect();
  })
  .catch(err => console.error('Gagal konek MongoDB:', err));  
