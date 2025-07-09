const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  recipient: String,
  courier: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);
