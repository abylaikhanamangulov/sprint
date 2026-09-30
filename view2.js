const fs = require('fs');
const text = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');
console.log('Гонки:', text.includes('Гонки'));
console.log('Р“РѕРЅРєРё:', text.includes('Р“РѕРЅРєРё'));
console.log('Р вЂњР С•Р Р…Р С”Р С‘:', text.includes('Р вЂњР С•Р Р…Р С”Р С‘'));
console.log('PvE heading:', text.substring(text.indexOf('PvE') - 100, text.indexOf('PvE')));
