const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/(tabs)/index.tsx'), 'utf8');

const replacements = [
  ['Medicine Management', "{t('dashboard.medicine_management')}"],
  ['Update Invoice', "{t('dashboard.update_invoice')}"],
  ['Search Medicines', "{t('dashboard.search_medicines')}"],
  ['Total Medicines', "{t('dashboard.total_medicines')}"],
  ['Out of Stock', "{t('dashboard.out_of_stock')}"],
  ["totalMedicines: '1,248'", "totalMedicines: '1,248'"], // The mock data
];

replacements.forEach(([search, replace]) => {
  // Be careful with replacing plain text inside JSX.
  // This simple replace targets exact matches.
  content = content.replace(new RegExp(`>\\s*${search}\\s*<`, 'g'), `>${replace}<`);
  
  // Also try replacing without brackets just in case
  content = content.replace(`'${search}'`, `t('dashboard.${search.toLowerCase().replace(/ /g, '_')}')`);
});

fs.writeFileSync(path.join(__dirname, 'src/app/(tabs)/index.tsx'), content);
console.log('Patched index.tsx with more translations.');
