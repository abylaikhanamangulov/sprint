import styled from 'styled-components';
import type { Car, CarCosmetics } from '../../models/types';
import { Card, ClassBadge } from '../ui';
import { CarSprite } from './CarSprite';
import coinIcon from 'src/components/icons/assets/coin.svg';

interface Props {
  car: Car;
  cosmetics?: CarCosmetics;
  currentPP?: number;
  isSelected?: boolean;
  onClick?: () => void;
  showPrice?: boolean;
}

const Wrapper = styled(Card)`
  min-width: 160px;
  flex: 0 0 auto;
  padding: 12px;
`;

const SpriteBox = styled.div`
  height: 80px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const Name = styled.span`
  font-size: 13px;
  font-weight: 600;
`;

const PP = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Price = styled.div`
  font-size: 12px;
  margin-top: 4px;
`;

const SelectedLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 700;
  margin-top: 4px;
  text-transform: uppercase;
`;

export function CarCard({ car, cosmetics, currentPP, isSelected, onClick, showPrice }: Props) {
  return (
    <Wrapper $selected={isSelected} $clickable={!!onClick} onClick={onClick}>
      <SpriteBox>
        <CarSprite car={car} width={150} cosmetics={cosmetics} />
      </SpriteBox>
      <TitleRow>
        <Name>{car.name}</Name>
        <ClassBadge $class={car.class}>{car.class}</ClassBadge>
      </TitleRow>
      <PP>
        PP: <strong>{currentPP ?? car.basePP}</strong>
      </PP>
      {showPrice && (
        <Price>
          {car.priceCoins != null ? (
            <span style={{ color: 'var(--silver)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} /> {car.priceCoins.toLocaleString()}</span>
          ) : (
            <span style={{ color: '#2ed573' }}>Бесплатно</span>
          )}
        </Price>
      )}
      {isSelected && <SelectedLabel>Выбрана</SelectedLabel>}
    </Wrapper>
  );
}
