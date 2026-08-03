const express = require('express');
const router = express.Router();
const multer = require('multer');
const Employee = require('../models/Employee');
const Package = require('../models/Package');
const transporter = require('../utils/mailer');
const { logAction } = require('../utils/logger');
const { requireLogin } = require('../utils/authMiddleware');

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET form
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    const packages = await Package.find().sort({ date: -1 }); // ambil data paket untuk tabel
    res.render('package', { employees, packages });
  } catch (err) {
    console.error('Gagal mengambil data karyawan/paket:', err);
    res.status(500).send('Gagal mengambil data karyawan/paket');
  }
});

// POST form + kirim email
router.post('/', upload.single('fotoPaket'), async (req, res) => {
  const {
    nomorResi,
    tipePaket,
    deskripsiPaket,
    namaKurir,
    emailKurir,
    nomorHpKurir,
    pengirim,
    tujuanPaket // ini adalah _id karyawan
  } = req.body;

  try {
    // Ambil data karyawan berdasarkan ID
    const employee = await Employee.findById(tujuanPaket);
    if (!employee) throw new Error('Karyawan tidak ditemukan');

    // Simpan data paket ke database, sertakan nama karyawan
    await Package.create({
      nomorResi,
      tipePaket,            // BUG FIX: simpan sebagai tipePaket (sesuai schema yg baru)
      deskripsiPaket,
      namaKurir,
      emailKurir,
      nomorHpKurir,
      pengirim,             // BUG FIX: simpan field pengirim
      penerimaNama: employee.name,
      penerimaEmail: employee.email,  // BUG FIX: simpan email penerima
      fotoPaket: req.file ? req.file.filename : null,
      createdAt: new Date()
    });

    // ── Helper: baris tabel info ──────────────────────────
    const infoRow = (label, value, shaded = false) =>
      `<tr style="background:${shaded ? '#f8fafc' : '#ffffff'};">
        <td style="padding:9px 14px;font-size:13px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:9px 14px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">${value}</td>
      </tr>`;

    // Kirim email ke karyawan
    await transporter.sendMail({
      from: `"BPMA GATELOG" <${process.env.MY_GMAIL}>`,  // BUG FIX: gunakan MY_GMAIL (konsisten)
      to: employee.email,
      subject: `📦 [BPMA GateLog] Paket Masuk untuk Anda dari ${namaKurir}`,
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
                Informasi Paket Masuk
              </span>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

          <!-- Sapaan -->
          <p style="margin:0 0 6px;font-size:15px;color:#1e293b;">Yth. Bapak/Ibu <strong>${employee.name}</strong>,</p>
          <p style="margin:0 0 24px;font-size:13px;color:#64748b;">Ada paket masuk untuk Anda. Mohon tinjau informasi di bawah dan silakan ambil paket Anda di pos keamanan.</p>

          <!-- Tabel Detail Paket -->
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Detail Informasi Paket</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;">
            ${infoRow('📦 Nomor Resi', nomorResi, false)}
            ${infoRow('🏷️ Jenis Paket', tipePaket, true)}
            ${infoRow('📝 Deskripsi', deskripsiPaket || '-', false)}
            ${infoRow('🚚 Nama Kurir', namaKurir, true)}
            ${infoRow('📧 Email Kurir', emailKurir, false)}
            ${infoRow('📱 Nomor HP Kurir', nomorHpKurir, true)}
            ${infoRow('🏢 Pengirim', pengirim, false)}
          </table>

          <!-- Info kontak kurir -->
          <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
            <p style="margin:0;font-size:12px;color:#64748b;">
              💬 Ingin menghubungi kurir langsung?
              <a href="mailto:${emailKurir}" style="color:#2563eb;font-weight:600;text-decoration:none;">${emailKurir}</a>
              ${nomorHpKurir ? `&nbsp;|&nbsp; 📱 ${nomorHpKurir}` : ''}
            </p>
          </div>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0f172a;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;">
            Email ini dikirim otomatis oleh sistem <strong style="color:#e2e8f0;">BPMA GateLog</strong>.<br>
            Mohon tidak membalas email ini.<br>
            © ${new Date().getFullYear()} Badan Pengelola Migas Aceh — Sistem Manajemen Akses Terintegrasi
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`,
      attachments: req.file ? [{
        filename: req.file.originalname,
        path: req.file.path
      }] : []
    });

    await logAction(req, 'CREATE', 'Package', `Menerima paket baru: ${nomorResi} dari ${namaKurir}`);

    res.redirect('/package');
  } catch (error) {
    console.error('Gagal kirim email atau simpan data:', error);
    res.status(500).send('Gagal mengirim email atau simpan data paket.');
  }
});

// Edit Package
router.post('/edit/:id', requireLogin, async (req, res) => {
  try {
    await Package.findByIdAndUpdate(req.params.id, req.body);
    await logAction(req, 'UPDATE', 'Package', `Memperbarui data paket: ${req.body.nomorResi || req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete Package
router.post('/delete/:id', requireLogin, async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE', 'Package', `Menghapus data paket ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
