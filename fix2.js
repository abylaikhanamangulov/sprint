const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');

// Fix the syntax error area around RESULT: Free Ride
const resultBlock = `  // ── RESULT: Free Ride`;
c = c.replace(/\}[ \t\r\n\u00A0\uFFFD]*RESULT:\s*Free\s*Ride[ \t\r\n\u00A0\uFFFD]*/g, '}\n\n' + resultBlock + '\n');

// Fix the endless button
const endlessRegex = /<Card \$clickable onClick=\{\(\) => vm\.startSelected\('endless'\)\}>[\s\S]*?<\/Card>/;
c = c.replace(endlessRegex, `<Card $clickable onClick={() => vm.startSelected('endless')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>Бесконечный</span>
                  <span style={{ color: '#4e7cff', fontWeight: 700 }}>∞</span>
                </div>
              </Card>`);

fs.writeFileSync('client/src/components/pages/Race/Race.tsx', c);
console.log('Fixed syntax and Endless button');
