const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { requireAdmin } = require('../utils/authMiddleware');
const { logAction } = require('../utils/logger');
// BUG FIX: Gunakan shared transporter dari utils/mailer.js
// (bukan buat transporter baru dengan EMAIL_USER/EMAIL_PASS yang tidak ada di .env)
const transporter = require('../utils/mailer');

// Fungsi pembantu untuk kirim email notifikasi ke visitor
const sendNotificationEmail = async (visitorEmail, visitorName, status, reqData) => {
  let subject = '';
  let htmlContent = '';

  const visitorId = reqData._id.toString().substring(18, 24).toUpperCase();

  // ── Helper: baris tabel info ──────────────────────────
  const infoRow = (label, value, shaded = false) =>
    `<tr style="background:${shaded ? '#f8fafc' : '#ffffff'};">
      <td style="padding:9px 14px;font-size:13px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
      <td style="padding:9px 14px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`;

  // ── Helper: wrapper email BPMA ────────────────────────
  const emailWrap = (accentColor, badge, bodyContent) => `
  <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:${accentColor};border-radius:14px 14px 0 0;padding:26px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="font-size:21px;font-weight:800;color:#fff;letter-spacing:1px;">🌿 BPMA <span style="font-weight:400;opacity:.85;">GateLog</span></span><br>
                <span style="font-size:10px;color:rgba(255,255,255,.7);letter-spacing:2px;text-transform:uppercase;">Badan Pengelola Migas Aceh</span>
              </td>
              <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;text-transform:uppercase;">${badge}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${bodyContent}
          </td>
        </tr>
        <tr>
          <td style="background:#0f172a;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;">
              Email ini dikirim otomatis oleh <strong style="color:#e2e8f0;">BPMA GateLog</strong>.<br>
              Mohon tidak membalas email ini langsung.<br>
              © ${new Date().getFullYear()} Badan Pengelola Migas Aceh
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  // ── Format jadwal ─────────────────────────────────────
  const jadwal = reqData.schedule
    ? new Date(reqData.schedule).toLocaleString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : '-';

  if (status === 'approved') {
    subject = '✅ Kunjungan Anda Disetujui — BPMA GateLog';
    htmlContent = emailWrap('#16a34a', 'Disetujui', `
      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;">✅</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#15803d;">Kunjungan Anda Disetujui!</p>
        <p style="margin:6px 0 0;font-size:13px;color:#166534;">Permohonan kunjungan Anda ke BPMA telah <strong>disetujui</strong> oleh <strong>${reqData.targetEmployee || reqData.bertemu}</strong>.</p>
      </div>
      <p style="font-size:14px;color:#475569;margin:0 0 20px;">Halo <strong style="color:#1e293b;">${visitorName}</strong>, berikut detail kunjungan yang telah dikonfirmasi:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('📋 Visitor ID', `<strong style="font-family:monospace;color:#1e3a8a;">VP-${visitorId}</strong>`, false)}
        ${infoRow('👤 Nama', visitorName, true)}
        ${infoRow('🤝 Menemui', reqData.targetEmployee || reqData.bertemu || '-', false)}
        ${infoRow('📌 Keperluan', reqData.purpose || '-', true)}
        ${infoRow('📅 Jadwal', jadwal, false)}
      </table>
      <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:18px 22px;margin-bottom:20px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1d4ed8;">📌 Petunjuk Kedatangan</p>
        <ol style="margin:0;padding-left:18px;font-size:13px;color:#1e40af;line-height:2;">
          <li>Tunjukkan email ini atau Visitor ID <strong>VP-${visitorId}</strong> kepada petugas keamanan.</li>
          <li>Petugas akan melakukan <strong>Check-In</strong> dan mencetak kartu akses Anda.</li>
          <li>Kenakan kartu akses selama berada di area BPMA.</li>
          <li>Laporkan kepada petugas saat hendak meninggalkan gedung (<strong>Check-Out</strong>).</li>
        </ol>
      </div>`);

  } else if (status === 'rejected') {
    subject = '❌ Permohonan Kunjungan Ditolak — BPMA GateLog';
    htmlContent = emailWrap('#dc2626', 'Ditolak', `
      <div style="background:#fff1f2;border:1.5px solid #fca5a5;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;">❌</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#b91c1c;">Permohonan Kunjungan Ditolak</p>
        <p style="margin:6px 0 0;font-size:13px;color:#991b1b;">Mohon maaf, permohonan Anda <strong>tidak dapat disetujui</strong> oleh <strong>${reqData.targetEmployee || reqData.bertemu}</strong>.</p>
      </div>
      <p style="font-size:14px;color:#475569;margin:0 0 20px;">Halo <strong style="color:#1e293b;">${visitorName}</strong>, berikut ringkasan permohonan yang diproses:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('👤 Nama', visitorName, false)}
        ${infoRow('🤝 Ditujukan ke', reqData.targetEmployee || reqData.bertemu || '-', true)}
        ${infoRow('📌 Keperluan', reqData.purpose || '-', false)}
        ${infoRow('📅 Jadwal Diajukan', jadwal, true)}
        ${reqData.employeeNotes ? infoRow('💬 Keterangan', reqData.employeeNotes, false) : ''}
      </table>
      <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:10px;padding:18px 22px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#854d0e;">💡 Apa yang bisa Anda lakukan?</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#713f12;line-height:2;">
          <li>Hubungi langsung <strong>${reqData.targetEmployee || reqData.bertemu}</strong> untuk informasi lebih lanjut.</li>
          <li>Ajukan permohonan kunjungan baru di lain waktu melalui form pendaftaran.</li>
        </ul>
      </div>`);

  } else if (status === 'reschedule') {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    subject = '📆 Mohon Jadwalkan Ulang Kunjungan — BPMA GateLog';
    htmlContent = emailWrap('#7c3aed', 'Jadwal Ulang', `
      <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;">📆</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#6d28d9;">Mohon Jadwalkan Ulang</p>
        <p style="margin:6px 0 0;font-size:13px;color:#5b21b6;"><strong>${reqData.targetEmployee || reqData.bertemu}</strong> meminta agar Anda mengajukan jadwal kunjungan yang baru.</p>
      </div>
      <p style="font-size:14px;color:#475569;margin:0 0 20px;">Halo <strong style="color:#1e293b;">${visitorName}</strong>, jadwal Anda sebelumnya adalah:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('👤 Nama', visitorName, false)}
        ${infoRow('🤝 Menemui', reqData.targetEmployee || reqData.bertemu || '-', true)}
        ${infoRow('📌 Keperluan', reqData.purpose || '-', false)}
        ${infoRow('📅 Jadwal Lama', `<s style="color:#94a3b8;">${jadwal}</s>`, true)}
        ${reqData.employeeNotes ? infoRow('💬 Keterangan', reqData.employeeNotes, false) : ''}
      </table>
      <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:10px;padding:18px 22px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 14px;font-size:14px;color:#5b21b6;font-weight:600;">Silakan ajukan permohonan kunjungan baru:</p>
        <a href="${appUrl}/visitor" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;">📝 Daftar Kunjungan Baru</a>
      </div>`);
  }

  if (subject && htmlContent) {
    try {
      await transporter.sendMail({
        from: `"BPMA GateLog" <${process.env.MY_GMAIL}>`,  // BUG FIX: gunakan MY_GMAIL
        to: visitorEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`Email notifikasi (${status}) terkirim ke ${visitorEmail}`);
    } catch (err) {
      console.error(`Gagal mengirim email ke ${visitorEmail}:`, err.message);
    }
  }
};

// GET: Tampilkan halaman Kelola Appointment
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Ambil data visitor yang belum di-approve/checked-in/checked-out
    // yaitu yang statusnya 'pending', 'reschedule', atau 'rejected' (untuk histori jika perlu, atau cukup pending saja)
    // Di sini kita ambil semua yang berstatus pending, reschedule, atau rejected
    const appointments = await Visitor.find({
      status: { $in: ['pending', 'reschedule', 'rejected'] }
    }).sort({ date: -1 });

    res.render('appointment', {
      appointments,
      user: req.session,
      request: req
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan memuat data appointment.');
  }
});

// POST: Update status appointment
router.post('/update/:id', requireAdmin, async (req, res) => {
  const { status, employeeNotes } = req.body;
  try {
    const validStatuses = ['approved', 'rejected', 'reschedule', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid' });
    }

    const updateData = { status };
    if (employeeNotes) {
      updateData.employeeNotes = employeeNotes;
    }

    const visitor = await Visitor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!visitor) {
      return res.status(404).json({ success: false, error: 'Data visitor tidak ditemukan' });
    }

    // Kirim email notifikasi ke visitor secara asinkron
    if (visitor.email) {
      sendNotificationEmail(visitor.email, visitor.name, status, visitor);
    }

    await logAction(req, 'UPDATE_STATUS', 'Appointment', `Mengubah status tamu ${visitor.name} menjadi: ${status.toUpperCase()}`);

    res.json({ success: true, message: `Status berhasil diubah menjadi ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
  }
});

module.exports = router;
