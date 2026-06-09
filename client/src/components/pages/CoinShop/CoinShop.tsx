import React from 'react';
import styled from 'styled-components';
import { useCoinShopViewModel } from 'src/viewmodels/useCoinShopViewModel';
import { Screen, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';
import { CoinPackage } from 'src/models/types';

const ShopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;

const BonusBanner = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(12px);
`;

const TreasureIcon = styled.div`
  font-size: 40px;
  line-height: 1;
`;

const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const BannerTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BannerBadge = styled.span`
  background: #ffffff;
  color: #1a1a1a;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
`;

const BannerSubtitle = styled.div`
  font-size: 14px;
  color: #8890a8;
  margin-top: 4px;
`;

const PremiumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const CoinsCard = styled.div`
  background: rgba(28, 33, 55, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ffd700, #ffa502);
    opacity: 0.5;
  }

  &:hover {
    transform: translateY(-4px);
    background: rgba(28, 33, 55, 0.8);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const DiscountRibbon = styled.div`
  position: absolute;
  top: 10px;
  right: -25px;
  background: #ff4757;
  color: white;
  padding: 4px 25px;
  font-size: 11px;
  font-weight: 800;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
`;

const IconCircle = styled.div<{ $bg: string }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
`;

const ItemTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const ItemDesc = styled.div`
  font-size: 12px;
  color: #8890a8;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const BuyButton = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  background: linear-gradient(135deg, #0088cc, #005580);
  color: #ffffff;
  border: transparent;

  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Toast = styled.div`
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid #2ed573;
  color: #2ed573;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export function CoinShopView() {
  const vm = useCoinShopViewModel();

  if (vm.loading || !vm.shop) {
    return <Loader />;
  }

  const shop = vm.shop;

  return (
    <Screen>
      <MainHeader title="Монеты" showClose={true} />

      {vm.message && <Toast onClick={vm.clearMessage}>{vm.message}</Toast>}

      <ShopContainer>
        <BonusBanner>
          <TreasureIcon>📦</TreasureIcon>
          <BannerContent>
            <BannerTitle>
              Бонус <BannerBadge>x2</BannerBadge> при первой покупке
            </BannerTitle>
            <BannerSubtitle>Только для наших бета-тестеров</BannerSubtitle>
          </BannerContent>
        </BonusBanner>

        <PremiumGrid>
          {shop.coinPackages.map((pkg: CoinPackage) => (
            <CoinsCard key={pkg.id}>
              {(pkg.discount || 0) > 0 && <DiscountRibbon>-{pkg.discount}%</DiscountRibbon>}
              <IconCircle $bg="linear-gradient(135deg, #ffd700, #ffa502)">
                <img src={coinIcon} alt="coin" style={{ width: 32, height: 32 }} />
              </IconCircle>
              <ItemTitle>{pkg.priceStars} ⭐</ItemTitle>
              <ItemDesc style={{ color: '#ffd700', fontWeight: 'bold' }}>
                <img src={coinIcon} alt="coin" style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 4 }} />
                {pkg.coins.toLocaleString()}
              </ItemDesc>
              <div style={{ flex: 1 }} />
              <BuyButton onClick={() => vm.buyCoins(pkg.id)}>
                Купить
              </BuyButton>
            </CoinsCard>
          ))}
        </PremiumGrid>
      </ShopContainer>
    </Screen>
  );
}
