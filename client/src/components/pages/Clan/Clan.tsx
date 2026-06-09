import { useClanViewModel } from './ClanViewModel';
import type { ClanTab } from './ClanViewModel';
import { Screen, Button, Row, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';

import { ClanCreateForm } from './components/ClanCreateForm';
import { ClanList } from './components/ClanList';
import { ClanMembers } from './components/ClanMembers';
import { ClanChat } from './components/ClanChat';
import { ClanWars } from './components/ClanWars';

const TAB_LABELS: Record<ClanTab, string> = {
  members: 'Участники',
  chat: 'Чат',
  wars: 'Войны',
};

export function ClanView() {
  const vm = useClanViewModel();

  if (vm.loading) {
    return <Loader />;
  }

  // No clan yet — list or create.
  if (!vm.hasClan) {
    if (vm.creating) {
      return <ClanCreateForm vm={vm} />;
    }
    return <ClanList vm={vm} />;
  }

  if (!vm.clan) {
    return <Loader />;
  }

  const clan = vm.clan;

  return (
    <Screen>
      <MainHeader 
        title={`[${clan.tag}] ${clan.name}`} 
        subtitle={`Ур.${clan.level} · Казна: ${clan.treasury.toLocaleString()} монет`} 
      />
      <div style={{ marginBottom: 12 }}>
        <Button $variant="danger" $size="sm" onClick={vm.leaveClan}>
          Выйти из клана
        </Button>
      </div>

      <Row $gap={8} style={{ marginBottom: 12 }}>
        {(['members', 'chat', 'wars'] as ClanTab[]).map((t) => (
          <Button
            key={t}
            $size="sm"
            $variant={vm.tab === t ? 'primary' : 'outline'}
            onClick={() => vm.setTab(t)}
          >
            {TAB_LABELS[t]}
          </Button>
        ))}
      </Row>

      {vm.tab === 'members' && <ClanMembers vm={vm} clan={clan} />}
      {vm.tab === 'chat' && <ClanChat vm={vm} clan={clan} />}
      {vm.tab === 'wars' && <ClanWars vm={vm} clan={clan} />}
    </Screen>
  );
}
