const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');
c = c.replace(/\\n/g, ''); // Remove literal \n strings if they exist at the end
if (c.endsWith('\\')) c = c.slice(0, -1);
fs.writeFileSync('client/src/components/pages/Race/Race.tsx', c);
console.log('Cleaned file');
