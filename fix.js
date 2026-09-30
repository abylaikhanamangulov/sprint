const fs = require('fs');
let c = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');
const search = 'if (vm.phase === \'result\' && (vm.dnf || vm.foul)) {';
let startIdx = c.indexOf(search);
if (startIdx === -1) {
    startIdx = c.indexOf('if (vm.phase === \'result\' && vm.dnf) {');
}
const endIdx = c.indexOf('RESULT: Free Ride', startIdx) - 10;
const replacement = `if (vm.phase === 'result' && (vm.dnf || vm.foul)) {
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 40 }}>
        <ResultIcon>{vm.foul ? '⚠️' : '🔥'}</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          {vm.foul ? 'ФАЛЬСТАРТ!' : 'ДВИГАТЕЛЬ ПЕРЕГРЕЛСЯ'}
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <Muted style={{ display: 'block' }}>
            {vm.foul ? 'Ты переключился на передачу до зеленого сигнала светофора. Дождись старта!' : 'Стрелка пробыла в красной зоне слишком долго. Переключайся вовремя!'}
          </Muted>
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button $variant="primary" onClick={vm.resetRun}>
            Ещё раз
          </Button>
          <Button $variant="outline" onClick={vm.toMenu}>
            Меню
          </Button>
        </div>
      </Screen>
    );
  }
`;
c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
fs.writeFileSync('client/src/components/pages/Race/Race.tsx', c);
console.log('Fixed');
