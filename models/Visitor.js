const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nik: { type: String },
  email: { type: String, required: true },
  institution: { type: String, required: true },
  targetEmployee: { type: String, required: true },
  hasAppointment: { type: String, required: true },
  purpose: { type: String, required: true },
  companions: { type: Number, required: true },
  schedule: { type: Date, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  visitCategory: { type: String, default: 'Meeting' },
  phoneNumber: { type: String, default: '-' },
  priority: { type: String, default: 'Normal' },
  employeeNotes: { type: String }
});

module.exports = mongoose.model('Visitor', visitorSchema);
