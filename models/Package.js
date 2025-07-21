const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  nomorResi: String,
  jenisPaket: String,
  deskripsiPaket: String,
  namaKurir: String,
  emailKurir: String,
  nomorHpKurir: String,
  penerimaPaket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  fotoPaket: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Package', packageSchema);
