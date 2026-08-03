const AuditLog = require('../models/AuditLog');

/**
 * Fungsi untuk mencatat aktivitas user ke dalam database
 * @param {Object} req - Request object dari Express (untuk ambil data session user)
 * @param {String} action - Jenis aksi (contoh: "CREATE", "UPDATE", "DELETE", "LOGIN")
 * @param {String} entity - Entitas yang dipengaruhi (contoh: "Visitor", "Package", "System")
 * @param {String} details - Pesan detail aktivitas
 */
const logAction = async (req, action, entity, details) => {
  try {
    const user = req.session && req.session.name ? req.session.name : 'Unknown User';
    const role = req.session && req.session.role ? req.session.role : 'System';

    await AuditLog.create({
      user,
      role,
      action,
      entity,
      details
    });
    
    // Optional: console.log(`[AUDIT] ${user} (${role}) did ${action} on ${entity}: ${details}`);
  } catch (error) {
    console.error('Gagal mencatat Audit Log:', error.message);
  }
};

module.exports = { logAction };
