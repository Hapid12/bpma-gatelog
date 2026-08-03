const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
    // e.g. "CREATE", "UPDATE", "DELETE", "LOGIN", "CHECK_IN", "CHECK_OUT"
  },
  entity: {
    type: String,
    required: true
    // e.g. "Visitor", "Package", "System", "Appointment"
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
