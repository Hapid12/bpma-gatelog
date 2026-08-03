const fs = require('fs');
const path = require('path');
const viewsDir = path.join(__dirname, 'views');
const targetFiles = [
  'dashboard.ejs', 'approval.ejs', 'appointment.ejs', 'laporan.ejs', 'auditLog.ejs', 'visitor.ejs', 'package.ejs'
];

targetFiles.forEach(file => {
  const filePath = path.join(viewsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix text-slate-800 back to text-white on buttons/badges
    content = content.replace(/text-slate-800 font-medium text-xs px-4 py-2/g, 'text-white font-medium text-xs px-4 py-2');
    content = content.replace(/bg-rose-500 text-slate-800/g, 'bg-rose-500 text-white');
    content = content.replace(/text-slate-800 bg-\[#5ca82f\]/g, 'text-white bg-[#5ca82f]');
    content = content.replace(/text-slate-800 hover:text-white/g, 'text-slate-500 hover:text-[#5ca82f]');
    
    // Some buttons were manually having text-white but converted to text-slate-800
    // e.g. <button type="submit" class="w-full bg-[#5ca82f] text-slate-800...
    content = content.replace(/bg-\[#5ca82f\] text-slate-800/g, 'bg-[#5ca82f] text-white');
    
    // Remove "border border-slate-200" duplicates
    content = content.replace(/border-slate-200 border border-slate-200/g, 'border border-slate-200');
    
    // Change some generic blue classes that were missed
    content = content.replace(/bg-blue-500 rounded-l-xl/g, 'bg-[#5ca82f] rounded-l-xl');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
