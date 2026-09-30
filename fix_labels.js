const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');

c = c.replace(/<span>\uFFFD+<\/span>/g, '<span>метры</span>');
c = c.replace(/<span>макс км\/ч<\/span>/g, '<span>макс. км/ч</span>'); // Wait, let's just make it shorter if needed, but let's stick to "км/ч"
c = c.replace(/<span>макс км\/ч<\/span>/g, '<span>км/ч</span>');
// Let's also make sure we match literal '' if \uFFFD fails
c = c.replace(/<span><\/span>/g, '<span>метры</span>');
c = c.replace(/<span>\?+<\/span>/g, '<span>метры</span>'); // Just in case it's literal question marks

fs.writeFileSync('client/src/components/pages/Race/Race.tsx', c);
console.log('Fixed telemetry labels');
