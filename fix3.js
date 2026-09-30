const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');

const targetStr = 'RESULT: Free Ride';
const targetIndex = c.indexOf(targetStr);

if (targetIndex !== -1) {
    const endIdx = c.indexOf("if (vm.phase === 'result' && vm.mode === 'free')", targetIndex);
    const startIdx = c.lastIndexOf('}', targetIndex) + 1;
    
    if (startIdx !== 0 && endIdx !== -1) {
        c = c.substring(0, startIdx) + '\n\n  // ── RESULT: Free Ride\n  ' + c.substring(endIdx);
        fs.writeFileSync('client/src/components/pages/Race/Race.tsx', c);
        console.log('Fixed syntax by splicing!');
    } else {
        console.log('Failed to find start or end index.');
    }
} else {
    console.log('Failed to find target string.');
}
