// routes/visitor.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Employee = require('../models/Employee');
const transporter = require('../utils/mailer');
const { logAction } = require('../utils/logger');
const { requireLogin } = require('../utils/authMiddleware');


// GET: Halaman visitor
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ date: -1 });
    const employees = await Employee.find();
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('visitor', {
      visitors,
      employees,
      successMessage,
      errorMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat data visitor');
  }
});

// POST: Form visitor
router.post('/', async (req, res) => {
  try {
    const {
      nama,
      email,
      instansi,
      bertemu,
      janji,
      keperluan,
      rekan,
      tanggal,
      nik,
      jenisKunjungan,
      nomorHp,
      prioritas
    } = req.body;

    // Cari email karyawan
    const employeeName = bertemu.split(' - ')[0]; // hanya ambil nama
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      // BUG FIX: Cek apakah request adalah AJAX (dari fetch) atau form biasa
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ success: false, message: 'Karyawan tidak ditemukan.' });
      }
      req.flash('error', 'Karyawan tidak ditemukan.');
      return res.redirect('/visitor');
    }

    const newVisitor = await Visitor.create({
      name: nama,
      nik: nik || '',
      email: email,
      institution: instansi,
      targetEmployee: bertemu,
      hasAppointment: janji,
      purpose: keperluan,
      companions: Number(rekan) || 0,
      schedule: new Date(`${tanggal}T${req.body.jam || '00:00'}`),  // BUG FIX: sertakan jam
      date: new Date(),
      visitCategory: jenisKunjungan || 'Meeting',
      phoneNumber: nomorHp || '-',
      priority: prioritas || 'Normal'
    });

    // Ambil base URL dari env
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // ── Helper: baris tabel info ──────────────────────────
    const infoRow = (label, value, shaded = false) =>
      `<tr style="background:${shaded ? '#f8fafc' : '#ffffff'};">
        <td style="padding:9px 14px;font-size:13px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:9px 14px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">${value}</td>
      </tr>`;

    // ── Badge prioritas ───────────────────────────────────
    const prioritasBadge = prioritas === 'Mendesak'
      ? `<span style="background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">🔴 Mendesak</span>`
      : prioritas === 'Penting'
      ? `<span style="background:#fef9c3;color:#92400e;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">🟡 Penting</span>`
      : `<span style="background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">🟢 Normal</span>`;

    // ── Format jadwal ─────────────────────────────────────
    const jadwalFormatted = new Date(`${tanggal}T${req.body.jam || '00:00'}`)
      .toLocaleString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });

    const mailOptions = {
      from: `"BPMA GateLog" <${process.env.MY_GMAIL}>`,
      to: employee.email,
      subject: `📋 [BPMA GateLog] Permintaan Pertemuan dari ${nama}`,
      html: `
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr>
        <td style="background:#1e3a8a;border-radius:14px 14px 0 0;padding:26px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td valign="middle">
              <span style="font-size:21px;font-weight:800;color:#ffffff;letter-spacing:1px;">🌿 BPMA <span style="font-weight:400;opacity:.85;">GateLog</span></span><br>
              <span style="font-size:10px;color:rgba(255,255,255,.65);letter-spacing:2px;text-transform:uppercase;">Badan Pengelola Migas Aceh</span>
            </td>
            <td align="right" valign="middle">
              <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">
                Permintaan Pertemuan
              </span>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

          <!-- Sapaan -->
          <p style="margin:0 0 6px;font-size:15px;color:#1e293b;">Yth. Bapak/Ibu <strong>${bertemu}</strong>,</p>
          <p style="margin:0 0 24px;font-size:13px;color:#64748b;">Ada tamu yang ingin menemui Anda. Mohon tinjau informasi di bawah dan berikan respons Anda.</p>

          <!-- Alert Prioritas jika Mendesak/Penting -->
          ${prioritas !== 'Normal' ? `
          <div style="background:${prioritas === 'Mendesak' ? '#fff1f2' : '#fefce8'};border:1.5px solid ${prioritas === 'Mendesak' ? '#fca5a5' : '#fde047'};border-radius:10px;padding:12px 18px;margin-bottom:20px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:${prioritas === 'Mendesak' ? '#b91c1c' : '#854d0e'};">
              ${prioritas === 'Mendesak' ? '🚨 Perhatian: Permintaan ini bersifat MENDESAK — mohon segera ditanggapi.' : '⚠️ Permintaan ini ditandai sebagai PENTING.'}
            </p>
          </div>` : ''}

          <!-- Tabel Detail Tamu -->
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Detail Informasi Tamu</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
            ${infoRow('👤 Nama Tamu', nama, false)}
            ${infoRow('🪪 NIK', nik || 'Tidak dicantumkan', true)}
            ${infoRow('🏢 Instansi', instansi, false)}
            ${infoRow('📧 Email', email, true)}
            ${infoRow('📱 Nomor HP', nomorHp || '-', false)}
            ${infoRow('🗂️ Jenis Kunjungan', jenisKunjungan || 'Meeting', true)}
            ${infoRow('🚦 Prioritas', prioritasBadge, false)}
            ${infoRow('📌 Keperluan', keperluan, true)}
            ${infoRow('👥 Jumlah Tamu', `${rekan} orang`, false)}
            ${infoRow('📅 Jadwal Kunjungan', jadwalFormatted, true)}
          </table>

          <!-- Tombol Aksi -->
          <p style="margin:0 0 16px;font-size:13px;color:#475569;text-align:center;font-weight:600;">
            Silakan pilih respons Anda terhadap permintaan kunjungan ini:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td align="center" style="padding:0 6px;">
                <a href="${appUrl}/response/approved/${newVisitor._id}"
                   style="display:block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:13px 0;border-radius:8px;text-align:center;">
                  ✅ Setujui Kunjungan
                </a>
              </td>
              <td align="center" style="padding:0 6px;">
                <a href="${appUrl}/response/rejected/${newVisitor._id}"
                   style="display:block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:13px 0;border-radius:8px;text-align:center;">
                  ❌ Tolak Kunjungan
                </a>
              </td>
              <td align="center" style="padding:0 6px;">
                <a href="${appUrl}/response/reschedule/${newVisitor._id}"
                   style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:13px 0;border-radius:8px;text-align:center;">
                  📆 Jadwal Ulang
                </a>
              </td>
            </tr>
          </table>

          <!-- Info kontak tamu -->
          <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
            <p style="margin:0;font-size:12px;color:#64748b;">
              💬 Ingin menghubungi tamu langsung?
              <a href="mailto:${email}" style="color:#2563eb;font-weight:600;text-decoration:none;">${email}</a>
              ${nomorHp ? `&nbsp;|&nbsp; 📱 ${nomorHp}` : ''}
            </p>
          </div>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0f172a;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;">
            Email ini dikirim otomatis oleh sistem <strong style="color:#e2e8f0;">BPMA GateLog</strong>.<br>
            Mohon tidak membalas email ini. Gunakan tombol di atas untuk merespons.<br>
            © ${new Date().getFullYear()} Badan Pengelola Migas Aceh — Sistem Manajemen Akses Terintegrasi
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`
    };

    await transporter.sendMail(mailOptions);

    await logAction(req, 'CREATE', 'Visitor', `Mendaftarkan tamu baru: ${nama} (${instansi}) - Kategori: ${jenisKunjungan}, Prioritas: ${prioritas}`);

    // BUG FIX: Balas dengan JSON jika request dari AJAX fetch, redirect jika form biasa
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.json({ success: true, message: 'Data berhasil dikirim dan email telah dikirim ke karyawan.' });
    }
    req.flash('success', 'Data berhasil dikirim dan email telah dikirim ke karyawan.');
    res.redirect('/visitor');
  } catch (error) {
    console.error(error);
    // BUG FIX: Balas JSON jika AJAX request
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ success: false, message: 'Gagal menyimpan data visitor.' });
    }
    req.flash('error', 'Gagal menyimpan data visitor.');
    res.redirect('/visitor');
  }
});

// GET: Form edit visitor
router.get('/edit/:id', requireLogin, async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  const employees = await Employee.find();
  res.render('editVisitor', { visitor, employees });
});

// Edit Visitor
router.post('/edit/:id', requireLogin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Map Indonesian EJS/AJAX fields to schema fields if they exist
    if (req.body.instansi) updateData.institution = req.body.instansi;
    if (req.body.bertemu) updateData.targetEmployee = req.body.bertemu;
    if (req.body.janji) updateData.hasAppointment = req.body.janji;
    if (req.body.rekan !== undefined) updateData.companions = Number(req.body.rekan);
    
    // Combine tanggal and jam into schedule if they are provided
    if (req.body.tanggal) {
      const jam = req.body.jam || '00:00';
      updateData.schedule = new Date(`${req.body.tanggal}T${jam}`);
    }

    // Map new fields
    if (req.body.jenisKunjungan) updateData.visitCategory = req.body.jenisKunjungan;
    if (req.body.nomorHp) updateData.phoneNumber = req.body.nomorHp;
    if (req.body.prioritas) updateData.priority = req.body.prioritas;

    await Visitor.findByIdAndUpdate(req.params.id, updateData);
    await logAction(req, 'UPDATE', 'Visitor', `Memperbarui data tamu: ${req.body.name || req.body.nama || req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete Visitor
router.post('/delete/:id', requireLogin, async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE', 'Visitor', `Menghapus data tamu ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});



module.exports = router;
