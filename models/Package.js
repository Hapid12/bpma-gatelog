const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  nomorResi: String,
  tipePaket: String,        // BUG FIX: route kirim 'tipePaket', bukan 'jenisPaket'
  jenisPaket: String,       // simpan juga field lama untuk kompatibilitas
  deskripsiPaket: String,
  namaKurir: String,
  emailKurir: String,
  nomorHpKurir: String,
  pengirim: String,         // BUG FIX: field ini dipakai route tapi tidak ada di schema
  penerimaPaket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  penerimaNama: String,
  penerimaEmail: String,    // BUG FIX: field ini dipakai route tapi tidak ada di schema
  fotoPaket: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Package', packageSchema);
