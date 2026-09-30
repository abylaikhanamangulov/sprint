const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');
const lines = c.split('\n');
const idx = lines.findIndex(l => l.includes("vm.startSelected('endless')"));
if (idx !== -1) {
    lines[idx + 2] = '                  <span style={{ fontSize: 18, fontWeight: 800 }}>Бесконечный</span>';
    lines[idx + 3] = '                  <span style={{ color: \'#4e7cff\', fontWeight: 700 }}>∞</span>';
    fs.writeFileSync('client/src/components/pages/Race/Race.tsx', lines.join('\n'));
    console.log('Fixed endless text via line replace');
}
