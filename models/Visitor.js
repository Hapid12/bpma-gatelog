const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: String,
  purpose: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', visitorSchema);
