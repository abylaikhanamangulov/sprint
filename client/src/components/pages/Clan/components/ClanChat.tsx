import { Column, Row, TextInput, Button, Muted } from 'src/views/ui';

interface Props {
  vm: ReturnType<typeof import('../ClanViewModel').useClanViewModel>;
  clan: any;
}

export function ClanChat({ vm, clan }: Props) {
  return (
    <Column style={{ height: 'calc(100dvh - 280px)' }}>
      <Column $gap={6} style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
        {clan.messages.map((msg: any, i: number) => {
          const member = clan.members.find((m: any) => m.userId === msg.userId);
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
  );
}
