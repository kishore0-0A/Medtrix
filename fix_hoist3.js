const fs = require('fs');
const path = require('path');

// Fix ai-triage.tsx
const triagePath = path.join(__dirname, 'src/app/profile/ai-triage.tsx');
let triage = fs.readFileSync(triagePath, 'utf8');

if (triage.includes('useEffect(() => {')) {
  triage = triage.replace(
    /useEffect\(\(\) => \{\s+loadInventoryStats\(\);\s+\}, \[\]\);/g,
    ''
  );
  
  triage = triage.replace(
    /const handleSend = \(\) => \{/g,
    'useEffect(() => {\n    loadInventoryStats();\n  }, []);\n\n  const handleSend = () => {'
  );
  fs.writeFileSync(triagePath, triage);
}

// Fix hospital.tsx
const hospPath = path.join(__dirname, 'src/app/profile/hospital.tsx');
let hosp = fs.readFileSync(hospPath, 'utf8');

if (hosp.includes('useEffect(() => {')) {
  hosp = hosp.replace(
    /useEffect\(\(\) => \{\s+loadHospital\(\);\s+\}, \[\]\);/g,
    ''
  );
  
  hosp = hosp.replace(
    /if \(loading\) \{/g,
    'useEffect(() => {\n    loadHospital();\n  }, []);\n\n  if (loading) {'
  );
  fs.writeFileSync(hospPath, hosp);
}

console.log('Fixed lint hoisting in ai-triage and hospital');
