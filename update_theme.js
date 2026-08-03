const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

// Daftar file yang akan diupdate
const targetFiles = [
  'dashboard.ejs',
  'approval.ejs',
  'appointment.ejs',
  'laporan.ejs',
  'auditLog.ejs',
  'visitor.ejs',
  'package.ejs'
];

// Dictionary replacements
const replacements = [
  // 1. Body & Background Utama
  { from: /bg-\[#0b0e14\]/g, to: 'bg-slate-50' },
  { from: /text-slate-200/g, to: 'text-slate-800' },
  { from: /bg-\[#0F1319\]\/80/g, to: 'bg-white/90' },
  { from: /bg-\[#0F1319\]/g, to: 'bg-slate-50' },
  
  // 2. Sidebar (Navy BPMA)
  { from: /bg-\[#0d121f\]/g, to: 'bg-[#1e3a8a]' },
  { from: /border-slate-800\/80/g, to: 'border-slate-200' },
  { from: /border-slate-800\/50/g, to: 'border-slate-200' },
  { from: /hover:bg-slate-800\/40/g, to: 'hover:bg-white/10' },
  // Khusus teks sidebar, beberapa text-slate-400 jadi text-blue-200 agar kontras dengan Navy
  
  // 3. Konten & Cards
  { from: /bg-\[#131924\]\/50/g, to: 'bg-white shadow-sm' },
  { from: /bg-\[#131924\]\/60/g, to: 'bg-white border-slate-200' },
  { from: /bg-\[#131924\]/g, to: 'bg-white' },
  
  // 4. Aksen Biru -> Hijau BPMA (#5ca82f)
  { from: /bg-blue-600/g, to: 'bg-[#5ca82f]' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-[#4a8a24]' },
  { from: /text-blue-400/g, to: 'text-[#5ca82f]' },
  { from: /text-blue-500/g, to: 'text-[#5ca82f]' },
  { from: /border-blue-500/g, to: 'border-[#5ca82f]' },
  { from: /shadow-blue-600/g, to: 'shadow-[#5ca82f]' },
  { from: /shadow-blue-500/g, to: 'shadow-[#5ca82f]' },
  { from: /ring-blue-500/g, to: 'ring-[#5ca82f]' },

  // 5. Text di Light Mode
  // Sidebar Header
  { from: /text-white tracking-wide/g, to: 'text-slate-800 tracking-wide' }, // Topbar h1
  // Card Text
  { from: /text-white/g, to: 'text-slate-800' }, // Kita akan ubah ini, tapi hati-hati di sidebar & form.
];

targetFiles.forEach(file => {
  const filePath = path.join(viewsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replacements
    // Custom replacements for specific text issues
    
    // Fix text-white inside Sidebar to remain white
    // Fix modal
    content = content.replace(/\.modal-content {[\s\S]*?}/, `.modal-content {\n      background-color: #ffffff !important;\n      border: 1px solid #e2e8f0 !important;\n      color: #1e293b !important;\n    }`);
    content = content.replace(/\.modal-header {[\s\S]*?}/, `.modal-header {\n      border-bottom: 1px solid #e2e8f0 !important;\n    }`);
    content = content.replace(/\.modal-footer {[\s\S]*?}/, `.modal-footer {\n      border-top: 1px solid #e2e8f0 !important;\n    }`);
    content = content.replace(/\.btn-close {[\s\S]*?}/, `.btn-close {\n      /* normal close button */\n    }`);
    content = content.replace(/\.modal-body table th {[\s\S]*?}/, `.modal-body table th {\n      background-color: #f8fafc !important;\n      color: #1e293b !important;\n      border-color: #e2e8f0 !important;\n    }`);
    content = content.replace(/\.modal-body table td {[\s\S]*?}/, `.modal-body table td {\n      border-color: #e2e8f0 !important;\n      color: #334155 !important;\n    }`);
    content = content.replace(/\.modal-body table {[\s\S]*?}/, `.modal-body table {\n      border-color: #e2e8f0 !important;\n    }`);
    content = content.replace(/background-color: #1e293b !important;/g, 'background-color: #f8fafc !important;'); // sticky table th

    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    // Sidebar specifically has text-white, we might have converted them to text-slate-800
    // To be safe, any text-slate-800 inside the sidebar needs to be white/blue-100
    // We will do this via a regex for aside block
    let asideMatch = content.match(/<aside[\s\S]*?<\/aside>/);
    if(asideMatch) {
        let asideContent = asideMatch[0];
        asideContent = asideContent.replace(/text-slate-800/g, 'text-white');
        asideContent = asideContent.replace(/text-slate-400/g, 'text-blue-200');
        asideContent = asideContent.replace(/text-slate-500/g, 'text-blue-300');
        asideContent = asideContent.replace(/border-slate-200/g, 'border-[#1e3a8a]/20');
        content = content.replace(/<aside[\s\S]*?<\/aside>/, asideContent);
    }
    
    // Topbar header text text-slate-800 tracking-wide is fine.
    
    // In tables, text-slate-400 -> text-slate-600
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-slate-300/g, 'text-slate-700');
    content = content.replace(/text-slate-500/g, 'text-slate-600');
    
    // Update body bg
    content = content.replace(/bg-slate-50 text-slate-800/, 'bg-slate-50 text-slate-800'); // make sure
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
