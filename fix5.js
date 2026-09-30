const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/RaceViewModel.ts', 'utf8');

c = c.replace(/export const RACE_LENGTHS:[\s\S]*?\];/, `export const RACE_LENGTHS: { id: RaceLength; meters: number; label: string; sub: string }[] = [
  { id: 'eighth', meters: 201, label: '1/8 мили', sub: '201 м' },
  { id: 'quarter', meters: 402, label: '1/4 мили', sub: '402 м' },
  { id: 'half', meters: 804, label: '1/2 мили', sub: '804 м' },
  { id: 'mile', meters: 1609, label: '1 миля', sub: '1609 м' },
];`);

fs.writeFileSync('client/src/components/pages/Race/RaceViewModel.ts', c);
console.log('Fixed RACE_LENGTHS');
