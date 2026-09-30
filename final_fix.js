const fs = require('fs');

// Fix Race.tsx
let race = fs.readFileSync('client/src/components/pages/Race/Race.tsx', 'utf8');

// 1. Layout Fix
race = race.replace(
  /const Tele = styled\.div\`\n  text-align: center;\n  flex: 1;/,
  'const Tele = styled.div`\n  text-align: center;\n  flex: 1;\n  min-width: 65px;\n  font-variant-numeric: tabular-nums;'
);

// 2. Foul / Overheat result screen
const searchDnf = "if (vm.phase === 'result' && vm.dnf) {";
const replaceDnf = `if (vm.phase === 'result' && (vm.dnf || vm.foul)) {
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 40 }}>
        <ResultIcon>{vm.foul ? '⚠️' : '🔥'}</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          {vm.foul ? 'ФАЛЬСТАРТ!' : 'ДВИГАТЕЛЬ ПЕРЕГРЕЛСЯ'}
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <Muted style={{ display: 'block' }}>
            {vm.foul ? 'Ты переключился на 1-ю передачу до зеленого сигнала светофора. Дождись старта!' : \`Стрелка пробыла в красной зоне больше \${OVERHEAT_LIMIT.toFixed(0)} секунд — мотор сдался. Заезд не засчитан. Переключайся до красной зоны!\`}
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
  }`;

if (race.includes(searchDnf)) {
  const start = race.indexOf(searchDnf);
  const end = race.indexOf('  // ── RESULT: Free Ride', start);
  if (end !== -1) {
    race = race.substring(0, start) + replaceDnf + '\n\n' + race.substring(end);
  }
}

fs.writeFileSync('client/src/components/pages/Race/Race.tsx', race);

// Fix RaceViewModel.ts
let vm = fs.readFileSync('client/src/components/pages/Race/RaceViewModel.ts', 'utf8');

// 3. Fix overheat bug (s.rpm >= REDLINE + missing setDnf)
const searchRev = `const overRevCut = s.rpm >= REDLINE && !isLast;
      if (overRevCut) {
        s.redTime += dt;
        if (s.redTime > OVERHEAT_LIMIT) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setPhase('result');
          return;
        }
      } else {
        s.redTime = Math.max(0, s.redTime - dt * 2);
      }`;

const replaceRev = `const overRevCut = s.rpm >= REDLINE && !isLast;
      const inRedZone = s.rpm > REDLINE - 200 && !isLast;
      if (inRedZone) {
        s.redTime += dt;
        if (s.redTime > OVERHEAT_LIMIT) {
          setDnf(true);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setPhase('result');
          return;
        }
      } else {
        s.redTime = Math.max(0, s.redTime - dt * 2);
      }`;

vm = vm.replace(searchRev, replaceRev);

// 4. Add foul check missing in racing phase (if any, though it was in countdown)
// Wait, the foul check was in countdown, let's verify
fs.writeFileSync('client/src/components/pages/Race/RaceViewModel.ts', vm);

console.log('Final fixes applied via JS string methods.');
