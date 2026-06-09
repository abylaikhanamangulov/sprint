import styled from 'styled-components';
import { useWelcomeViewModel } from 'src/components/pages/Welcome/WelcomeViewModel';
import { Screen, Button } from 'src/views/ui';
import { CarCard } from 'src/views/components/CarCard';

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 8px;
`;

const CarRow = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  justify-content: center;
  flex-wrap: wrap;
`;

interface Props {
  onDone: () => void;
}

export function WelcomeView({ onDone }: Props) {
  const vm = useWelcomeViewModel(onDone);

  return (
    <Screen style={{ textAlign: 'center', paddingTop: 40 }}>
      <Title>Добро пожаловать, {vm.firstName}! 👋</Title>
      <p style={{ color: '#8890a8', marginBottom: 24 }}>Выбери свой первый автомобиль для старта</p>

      <CarRow>
        {vm.starters.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            isSelected={vm.selected === car.id}
            onClick={() => vm.select(car.id)}
          />
        ))}
      </CarRow>

      {vm.selected && (
        <Button
          $variant="primary"
          $block
          onClick={vm.confirm}
          disabled={vm.loading}
          style={{ maxWidth: 300, margin: '16px auto' }}
        >
          {vm.loading ? 'Подтверждение...' : 'Подтвердить выбор'}
        </Button>
      )}
    </Screen>
  );
}
