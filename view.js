const fs = require('fs');
const text = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');
const i = text.indexOf("vm.startSelected('endless')");
if (i !== -1) {
    console.log(text.substring(i, i + 200));
}
