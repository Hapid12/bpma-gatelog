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
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Visitor', visitorSchema);
