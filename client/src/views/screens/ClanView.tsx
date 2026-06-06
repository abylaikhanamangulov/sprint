import styled from 'styled-components';
import { useClanViewModel } from '../../viewmodels/useClanViewModel';
import type { ClanTab } from '../../viewmodels/useClanViewModel';
import { Screen, Card, Button, Row, Column, Heading, Muted, EmptyState, Loader, TextInput } from '../ui';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Field = styled.div`
  margin-bottom: 12px;
  label {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  input {
    margin-top: 4px;
  }
`;

const ROLE_LABELS: Record<string, string> = {
  leader: 'Лидер',
  officer: 'Офицер',
  racer: 'Гонщик',
  recruit: 'Новичок',
};

const TAB_LABELS: Record<ClanTab, string> = {
  members: 'Участники',
  chat: 'Чат',
  wars: 'Войны',
};

export function ClanView() {
  const vm = useClanViewModel();

  if (vm.loading) {
    return (
      <Loader />
    );
  }

  // No clan yet — list or create.
  if (!vm.hasClan) {
    if (vm.creating) {
      return (
        <Screen>
          <Heading style={{ marginBottom: 16 }}>Создать клан</Heading>
          <Card>
            <Field>
              <label>Название</label>
              <TextInput
                value={vm.form.name}
                onChange={(e) => vm.setForm({ ...vm.form, name: e.target.value })}
                placeholder="Ночные Волки"
              />
            </Field>
            <Field>
              <label>Тег (2-4 буквы)</label>
              <TextInput
                value={vm.form.tag}
                maxLength={4}
                onChange={(e) =>
                  vm.setForm({ ...vm.form, tag: e.target.value.toUpperCase().slice(0, 4) })
                }
                placeholder="NW"
              />
            </Field>
            <Muted $size={11} style={{ display: 'block', marginBottom: 12 }}>
              Стоимость: 1,000 🪙
            </Muted>
            <Row $gap={8}>
              <Button $variant="primary" onClick={vm.createClan}>
                Создать
              </Button>
              <Button $variant="outline" onClick={() => vm.setCreating(false)}>
                Отмена
              </Button>
            </Row>
            {vm.error && <Muted style={{ color: '#ff4757', display: 'block', marginTop: 8 }}>{vm.error}</Muted>}
          </Card>
        </Screen>
      );
    }

    return (
      <Screen>
        <Header>
          <Heading>Кланы</Heading>
          <Button $variant="primary" $size="sm" onClick={() => vm.setCreating(true)}>
            + Создать
          </Button>
        </Header>
        <Column $gap={8}>
          {vm.clanList.map((c) => (
            <Card key={c.id}>
              <Row $justify="space-between">
                <div>
                  <span style={{ fontWeight: 700 }}>
                    [{c.tag}] {c.name}
                  </span>
                  <Muted $size={11} style={{ display: 'block', marginTop: 4 }}>
                    Ур.{c.level} · {c.memberCount} участников
                  </Muted>
                </div>
                <Button $variant="primary" $size="sm" onClick={() => vm.joinClan(c.id)}>
                  Вступить
                </Button>
              </Row>
            </Card>
          ))}
        </Column>
      </Screen>
    );
  }

  if (!vm.clan) {
    return (
      <Loader />
    );
  }

  const clan = vm.clan;

  return (
    <Screen>
      <Header>
        <div>
          <Heading>
            [{clan.tag}] {clan.name}
          </Heading>
          <Muted $size={11}>
            Ур.{clan.level} · Казна: {clan.treasury.toLocaleString()} 🪙
          </Muted>
        </div>
        <Button $variant="danger" $size="sm" onClick={vm.leaveClan}>
          Выйти
        </Button>
      </Header>

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

      {vm.tab === 'members' && (
        <>
          <Column $gap={6}>
            {clan.members.map((m) => (
              <Card key={m.userId} style={{ padding: 10 }}>
                <Row $justify="space-between">
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {m.firstName || m.username}
                    </span>
                    <Muted $size={11} style={{ marginLeft: 6 }}>
                      {ROLE_LABELS[m.role] || m.role}
                    </Muted>
                  </div>
                  <Muted $size={11}>Вклад: {m.contribution} 🪙</Muted>
                </Row>
              </Card>
            ))}
          </Column>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Пожертвовать в казну</div>
            <Row $gap={8}>
              {[100, 500, 1000].map((amt) => (
                <Button key={amt} $variant="outline" $size="sm" onClick={() => vm.donate(amt)}>
                  {amt} 🪙
                </Button>
              ))}
            </Row>
          </div>
        </>
      )}

      {vm.tab === 'chat' && (
        <Column style={{ height: 'calc(100dvh - 280px)' }}>
          <Column $gap={6} style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
            {clan.messages.map((msg, i) => {
              const member = clan.members.find((m) => m.userId === msg.userId);
              return (
                <div key={i} style={{ background: '#1c2137', padding: 8, borderRadius: 8 }}>
                  <Row $gap={8} style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4e7cff' }}>
                      {member?.firstName || member?.username || `User ${msg.userId}`}
                    </span>
                    <Muted $size={11}>
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Muted>
                  </Row>
                  <div style={{ fontSize: 13 }}>{msg.text}</div>
                </div>
              );
            })}
          </Column>
          <Row $gap={8}>
            <TextInput
              value={vm.chatText}
              onChange={(e) => vm.setChatText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && vm.sendMessage()}
              placeholder="Сообщение..."
            />
            <Button $variant="primary" onClick={vm.sendMessage}>
              ➤
            </Button>
          </Row>
        </Column>
      )}

      {vm.tab === 'wars' && (
        <Column $gap={8}>
          {vm.warState && vm.warState.warId > 0 && vm.warState.ghost && (
            <Card style={{ border: '1px solid #9b59b6' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>⚔️ Заезд войны</div>
              <Muted $size={12} style={{ display: 'block', marginBottom: 8 }}>
                Призрак: <strong>{vm.warState.ghost.name}</strong> на {vm.warState.ghost.carName} —
                цель ¼ мили за <strong>{vm.warState.ghost.time.toFixed(3)}с</strong>. Обгони его время и
                принеси клану очко.
              </Muted>
              <Button $variant="primary" $size="sm" $block onClick={vm.raceWarGhost}>
                Гонять за клан
              </Button>
            </Card>
          )}
          {clan.wars.map((war) => {
            const opponent = war.clanA === clan.id ? war.clanB : war.clanA;
            const ourScore = war.clanA === clan.id ? war.scoreA : war.scoreB;
            const theirScore = war.clanA === clan.id ? war.scoreB : war.scoreA;
            return (
              <Card key={war.id}>
                <Row $justify="space-between">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#2ed573' }}>{ourScore}</div>
                    <Muted $size={11}>Мы</Muted>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: war.status === 'active' ? '#2ed573' : '#8890a8',
                    }}
                  >
                    {war.status === 'active' ? 'ИДЁТ' : 'ЗАВЕРШЕНА'}
                  </span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#ff4757' }}>{theirScore}</div>
                    <Muted $size={11}>Клан #{opponent}</Muted>
                  </div>
                </Row>
              </Card>
            );
          })}
          {clan.wars.length === 0 && <EmptyState>Нет текущих войн</EmptyState>}
        </Column>
      )}
    </Screen>
  );
}
