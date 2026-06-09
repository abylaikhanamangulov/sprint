import styled from 'styled-components';
import { Screen, Card, Button, Row, TextInput, Muted } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';

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

interface Props {
  vm: ReturnType<typeof import('../ClanViewModel').useClanViewModel>;
}

export function ClanCreateForm({ vm }: Props) {
  return (
    <Screen>
      <MainHeader title="Создать клан" showClose={true} onClose={() => vm.setCreating(false)} />
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
        <Muted $size={11} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          Стоимость: 1,000 <img src={coinIcon} alt="coin" style={{ width: 12, height: 12 }} />
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
