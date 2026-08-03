const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const transporter = require('../utils/mailer');

// ─────────────────────────────────────────
// Helper: Base email wrapper (header + footer)
// ─────────────────────────────────────────
const emailWrapper = (accentColor, iconEmoji, badgeText, badgeBg, content) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BPMA GateLog Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:${accentColor};border-radius:14px 14px 0 0;padding:28px 36px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">
                      ${iconEmoji} BPMA <span style="font-weight:400;opacity:0.85;">GateLog</span>
                    </span>
                    <br>
                    <span style="font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">
                      Badan Pengelola Migas Aceh
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;
                                 padding:5px 14px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                Email ini dikirim secara otomatis oleh sistem <strong style="color:#e2e8f0;">BPMA GateLog</strong>.<br>
                Mohon tidak membalas email ini langsung.<br>
                © ${new Date().getFullYear()} Badan Pengelola Migas Aceh — Sistem Manajemen Akses Terintegrasi
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────
// Helper: Info row dalam tabel detail
// ─────────────────────────────────────────
const infoRow = (label, value, shaded = false) => `
  <tr style="background:${shaded ? '#f8fafc' : '#ffffff'};">
    <td style="padding:9px 14px;font-size:13px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">
      ${label}
    </td>
    <td style="padding:9px 14px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">
      ${value}
    </td>
  </tr>`;

// ─────────────────────────────────────────
// Helper: Format tanggal ke Bahasa Indonesia
// ─────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};


// ═══════════════════════════════════════════════════════════
// APPROVED — Email ke Pengunjung
// ═══════════════════════════════════════════════════════════
router.get('/approved/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error', title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    const visitorIdShort = `VP-${visitor._id.toString().substring(18, 24).toUpperCase()}`;

    const content = `
      <!-- Status Banner -->
      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:28px;">✅</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#15803d;">Kunjungan Anda Disetujui!</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#166534;">
          Permohonan kunjungan Anda ke BPMA telah <strong>disetujui</strong> oleh <strong>${visitor.targetEmployee}</strong>.
        </p>
      </div>

      <p style="font-size:14px;color:#475569;margin:0 0 20px 0;">
        Halo <strong style="color:#1e293b;">${visitor.name}</strong>, berikut adalah detail kunjungan yang telah dikonfirmasi:
      </p>

      <!-- Detail Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('📋 Pass ID', `<strong style="font-family:monospace;color:#1e3a8a;font-size:14px;">${visitorIdShort}</strong>`, false)}
        ${infoRow('👤 Nama', visitor.name, true)}
        ${infoRow('🏢 Instansi', visitor.institution || '-', false)}
        ${infoRow('🤝 Menemui', visitor.targetEmployee || '-', true)}
        ${infoRow('📌 Keperluan', visitor.purpose || '-', false)}
        ${infoRow('📅 Jadwal', formatDate(visitor.schedule), true)}
        ${infoRow('👥 Jumlah Tamu', `${visitor.companions || 0} orang`, false)}
      </table>

      <!-- Instruksi Check-In -->
      <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:18px 22px;margin-bottom:28px;">
        <p style="margin:0 0 10px 0;font-size:14px;font-weight:700;color:#1d4ed8;">📌 Petunjuk Kedatangan</p>
        <ol style="margin:0;padding-left:18px;font-size:13px;color:#1e40af;line-height:2;">
          <li>Tunjukkan email ini atau Visitor ID <strong>${visitorIdShort}</strong> kepada petugas keamanan.</li>
          <li>Petugas akan melakukan proses <strong>Check-In</strong> dan mencetak kartu akses Anda.</li>
          <li>Kenakan kartu akses selama berada di area BPMA.</li>
          <li>Laporkan kepada petugas saat Anda hendak meninggalkan gedung (<strong>Check-Out</strong>).</li>
        </ol>
      </div>

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;">
        Kartu akses hanya berlaku pada tanggal yang telah ditentukan. Jika ada perubahan, hubungi pihak BPMA.
      </p>`;

    await transporter.sendMail({
      from: `"BPMA GateLog" <${process.env.MY_GMAIL}>`,
      to: visitor.email,
      subject: `✅ Kunjungan Anda Disetujui — BPMA GateLog [${visitorIdShort}]`,
      html: emailWrapper('#16a34a', '🌿', 'Kunjungan Disetujui', '#15803d', content)
    });

    res.render('status', {
      status: 'approved',
      title: 'Permintaan Disetujui',
      message: 'Notifikasi konfirmasi telah dikirim ke email pengunjung.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error', title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});


// ═══════════════════════════════════════════════════════════
// REJECTED — Email ke Pengunjung
// ═══════════════════════════════════════════════════════════
router.get('/rejected/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).render('status', {
      status: 'error', title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    res.render('response_form', { action: 'reject', visitor });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error', title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

// REJECTED (POST Submit)
router.post('/rejected/:id', async (req, res) => {
  try {
    const { employeeNotes } = req.body;
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'rejected', employeeNotes }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error', title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    const content = `
      <!-- Status Banner -->
      <div style="background:#fff1f2;border:1.5px solid #fca5a5;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:28px;">❌</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#b91c1c;">Permohonan Kunjungan Ditolak</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#991b1b;">
          Mohon maaf, permohonan kunjungan Anda saat ini <strong>tidak dapat disetujui</strong> oleh <strong>${visitor.targetEmployee}</strong>.
        </p>
      </div>

      <!-- Keterangan Alasan Penolakan -->
      <div style="background:#ffebee;border-left:4px solid #ef5350;border-radius:6px;padding:16px 20px;margin-bottom:28px;text-align:left;">
        <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#c62828;">Alasan/Keterangan Penolakan:</p>
        <p style="margin:0;font-size:13px;color:#b71c1c;font-style:italic;line-height:1.5;">"${employeeNotes}"</p>
      </div>

      <p style="font-size:14px;color:#475569;margin:0 0 20px 0;">
        Halo <strong style="color:#1e293b;">${visitor.name}</strong>, berikut adalah ringkasan permohonan yang telah diproses:
      </p>

      <!-- Detail Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('👤 Nama', visitor.name, false)}
        ${infoRow('🏢 Instansi', visitor.institution || '-', true)}
        ${infoRow('🤝 Ditujukan ke', visitor.targetEmployee || '-', false)}
        ${infoRow('📌 Keperluan', visitor.purpose || '-', true)}
        ${infoRow('📅 Jadwal Diajukan', formatDate(visitor.schedule), false)}
      </table>

      <!-- Info Box -->
      <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:10px;padding:18px 22px;margin-bottom:28px;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#854d0e;">💡 Apa yang bisa Anda lakukan?</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#713f12;line-height:2;">
          <li>Hubungi langsung <strong>${visitor.targetEmployee}</strong> untuk informasi lebih lanjut.</li>
          <li>Ajukan permohonan kunjungan baru di lain waktu melalui form pendaftaran.</li>
          <li>Pastikan jadwal dan keperluan sudah sesuai sebelum mengajukan ulang.</li>
        </ul>
      </div>

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;">
        Kami mohon maaf atas ketidaknyamanan ini. Terima kasih atas pengertian Anda.
      </p>`;

    await transporter.sendMail({
      from: `"BPMA GateLog" <${process.env.MY_GMAIL}>`,
      to: visitor.email,
      subject: `❌ Permohonan Kunjungan Ditolak — BPMA GateLog`,
      html: emailWrapper('#dc2626', '🌿', 'Permohonan Ditolak', '#b91c1c', content)
    });

    res.render('status', {
      status: 'rejected',
      title: 'Permintaan Ditolak',
      message: 'Notifikasi penolakan beserta alasan telah dikirim ke email pengunjung.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error', title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});


// ═══════════════════════════════════════════════════════════
// RESCHEDULE — Email ke Pengunjung
// ═══════════════════════════════════════════════════════════
router.get('/reschedule/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).render('status', {
      status: 'error', title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    res.render('response_form', { action: 'reschedule', visitor });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error', title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

// RESCHEDULE (POST Submit)
router.post('/reschedule/:id', async (req, res) => {
  try {
    const { employeeNotes } = req.body;
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'reschedule', employeeNotes }, { new: true });
    if (!visitor) return res.status(404).render('status', {
      status: 'error', title: 'Data Tidak Ditemukan',
      message: 'Visitor dengan ID tersebut tidak ditemukan.'
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const content = `
      <!-- Status Banner -->
      <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:28px;">📆</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#6d28d9;">Mohon Jadwalkan Ulang Kunjungan</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#5b21b6;">
          <strong>${visitor.targetEmployee}</strong> meminta agar Anda mengajukan jadwal kunjungan yang baru.
        </p>
      </div>

      <!-- Keterangan Alasan Penjadwalan Ulang -->
      <div style="background:#e3f2fd;border-left:4px solid #1e88e5;border-radius:6px;padding:16px 20px;margin-bottom:28px;text-align:left;">
        <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1565c0;">Catatan / Usulan Jadwal Baru dari Karyawan:</p>
        <p style="margin:0;font-size:13px;color:#0d47a1;font-style:italic;line-height:1.5;">"${employeeNotes}"</p>
      </div>

      <p style="font-size:14px;color:#475569;margin:0 0 20px 0;">
        Halo <strong style="color:#1e293b;">${visitor.name}</strong>, jadwal kunjungan Anda sebelumnya adalah :
      </p>

      <!-- Detail Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
        ${infoRow('👤 Nama', visitor.name, false)}
        ${infoRow('🏢 Instansi', visitor.institution || '-', true)}
        ${infoRow('🤝 Menemui', visitor.targetEmployee || '-', false)}
        ${infoRow('📌 Keperluan', visitor.purpose || '-', true)}
        ${infoRow('📅 Jadwal Lama', `<s style="color:#94a3b8;">${formatDate(visitor.schedule)}</s>`, false)}
      </table>

      <!-- CTA Daftar Ulang -->
      <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:10px;padding:18px 22px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 14px 0;font-size:14px;color:#5b21b6;font-weight:600;">
          Silakan ajukan permohonan kunjungan baru dengan jadwal yang berbeda:
        </p>
        <a href="${appUrl}/visitor"
           style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;
                  font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;letter-spacing:0.5px;">
          📝 Daftar Kunjungan Baru
        </a>
      </div>

      <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:4px;">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#475569;">💡 Tips mengajukan ulang:</p>
        <ul style="margin:0;padding-left:18px;font-size:12px;color:#64748b;line-height:1.9;">
          <li>Pilih jadwal di luar jam sibuk (hindari Senin pagi dan Jumat sore).</li>
          <li>Hubungi <strong>${visitor.targetEmployee}</strong> terlebih dahulu untuk konfirmasi ketersediaan.</li>
          <li>Cantumkan keperluan yang lebih spesifik agar mudah diproses.</li>
        </ul>
      </div>`;

    await transporter.sendMail({
      from: `"BPMA GateLog" <${process.env.MY_GMAIL}>`,
      to: visitor.email,
      subject: `📆 Mohon Jadwalkan Ulang Kunjungan Anda — BPMA GateLog`,
      html: emailWrapper('#7c3aed', '🌿', 'Jadwal Ulang', '#6d28d9', content)
    });

    res.render('status', {
      status: 'reschedule',
      title: 'Perlu Penjadwalan Ulang',
      message: 'Notifikasi penjadwalan ulang beserta alasan telah dikirim ke email pengunjung.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('status', {
      status: 'error', title: 'Terjadi Kesalahan',
      message: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

module.exports = router;
