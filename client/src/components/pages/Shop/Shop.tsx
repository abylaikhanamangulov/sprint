import styled from 'styled-components';
import { useShopViewModel } from 'src/components/pages/Shop/ShopViewModel';
import type { ShopTab } from 'src/components/pages/Shop/ShopViewModel';
import { Screen, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';

const ShopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
  margin-bottom: 8px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent : 'transparent'};
  color: ${({ $active }) => ($active ? '#000000' : '#a1a1aa')};
  border: 1px solid ${({ $active }) => ($active ? 'transparent' : '#27272a')};

  &:active {
    transform: scale(0.96);
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

const PremiumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const PremiumCard = styled.div`
  background: #111111;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #18181b;
    border-color: #3f3f46;
  }
`;

const CratesCard = styled(PremiumCard)``;



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

const BuyButton = styled.button<{ $currency?: string }>`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
  
  background: ${({ theme }) => theme.colors.bgPrimary};
  color: #ffffff;
  border: 1px solid #3f3f46;

  &:hover {
    background: #27272a;
    border-color: #52525b;
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

const DealCard = styled.div`
  background: #111111;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const DealBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ff4757;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.4);
  z-index: 2;
`;

const PriceTag = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  z-index: 2;
`;

const OldPrice = styled.span`
  color: #8890a8;
  text-decoration: line-through;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const NewPrice = styled.span`
  color: #2ed573;
  font-size: 24px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-shadow: 0 2px 10px rgba(46, 213, 115, 0.3);
`;

const CarImage = styled.img`
  width: 180px;
  height: auto;
  object-fit: contain;
  margin: 16px 0;
  z-index: 2;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
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

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'deals', label: 'Скидки' },
  { id: 'packs', label: 'Паки' },
  { id: 'crates', label: 'Кейсы' },
  { id: 'cosmetics', label: 'Тюнинг' },
];

export function ShopView() {
  const vm = useShopViewModel();

  if (vm.loading || !vm.shop) {
    return <Loader />;
  }

  const shop = vm.shop;

  return (
    <Screen>
      <MainHeader title="Магазин" />

      {vm.message && <Toast onClick={vm.clearMessage}>{vm.message}</Toast>}

      <TabBar>
        {TABS.map((t) => (
          <TabButton
            key={t.id}
            $active={vm.tab === t.id}
            onClick={() => vm.setTab(t.id)}
          >
            {t.label}
          </TabButton>
        ))}
      </TabBar>

      <ShopContainer>
        {vm.tab === 'deals' && shop.dailyDeal && (
          <DealCard>
            <DealBadge>-{shop.dailyDeal.discount}% СКИДКА</DealBadge>
            <ItemTitle style={{ fontSize: 22, zIndex: 2 }}>{shop.dailyDeal.car.name}</ItemTitle>
            <ItemDesc style={{ zIndex: 2, marginBottom: 0 }}>Уникальное предложение дня</ItemDesc>
            
            <CarImage src={shop.dailyDeal.car.image || '/mustang.png'} alt="Daily Deal Car" />
            
            <PriceTag>
              <OldPrice>
                {shop.dailyDeal.car.priceCoins?.toLocaleString()} <img src={coinIcon} alt="coin" style={{ width: 14, height: 14 }} />
              </OldPrice>
              <NewPrice>
                {shop.dailyDeal.discountedPrice?.toLocaleString()} <img src={coinIcon} alt="coin" style={{ width: 20, height: 20 }} />
              </NewPrice>
            </PriceTag>
            <BuyButton 
              style={{ marginTop: 24, zIndex: 2 }}
              onClick={() => console.log('Buy Deal clicked')} // Implement buy logic if needed
            >
              Купить по акции
            </BuyButton>
          </DealCard>
        )}

        {vm.tab === 'packs' && (
          <PremiumGrid>
            {shop.cardPacks?.map((pack) => {
              const bg = pack.tier === 'silver' ? 'linear-gradient(135deg, #bdc3c7, #2c3e50)'
                : pack.tier === 'gold' ? 'linear-gradient(135deg, #f1c40f, #f39c12)'
                : pack.tier === 'platinum' ? 'linear-gradient(135deg, #00d2d3, #0abde3)'
                : 'linear-gradient(135deg, #9b59b6, #8e44ad)';
              return (
                <CratesCard key={pack.id}>
                  <IconCircle $bg={bg}>
                    🎴
                  </IconCircle>
                  <ItemTitle>{pack.name}</ItemTitle>
                  <ItemDesc>{pack.slots} слотов<br/>Шанс на авто!</ItemDesc>
                  <div style={{ flex: 1 }} />
                  <BuyButton 
                    $currency={pack.price.currency}
                    onClick={() => vm.openPack(pack.id)}
                  >
                    {pack.price.amount}
                    {pack.price.currency === 'stars' ? '⭐' : pack.price.currency === 'points' ? '⚡' : <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />}
                  </BuyButton>
                </CratesCard>
              );
            })}
          </PremiumGrid>
        )}

        {vm.tab === 'crates' && (
          <PremiumGrid>
            {shop.crates.map((crate) => (
              <CratesCard key={crate.id}>
                <IconCircle $bg="linear-gradient(135deg, #9b59b6, #e056fd)">
                  📦
                </IconCircle>
                <ItemTitle>{crate.name}</ItemTitle>
                <ItemDesc>{crate.description}</ItemDesc>
                <div style={{ flex: 1 }} />
                <BuyButton 
                  $currency={crate.price.currency}
                  onClick={() => vm.buyCrate(crate.id)}
                >
                  {crate.price.amount}
                  {crate.price.currency === 'stars' ? '⭐' : <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />}
                </BuyButton>
              </CratesCard>
            ))}
          </PremiumGrid>
        )}

        {vm.tab === 'cosmetics' && (
          <PremiumGrid>
            {shop.cosmetics.map((item) => (
              <PremiumCard key={item.id}>
                {item.value && item.type === 'paint' ? (
                  <IconCircle $bg={item.value} style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                ) : (
                  <IconCircle $bg="linear-gradient(135deg, #34495e, #2c3e50)">
                    🎨
                  </IconCircle>
                )}
                <ItemTitle>{item.name}</ItemTitle>
                <ItemDesc>Кастомизация</ItemDesc>
                <div style={{ flex: 1 }} />
                <BuyButton 
                  $currency={item.price.currency}
                  onClick={() => vm.buyCosmetic(item.id)}
                >
                  {item.price.amount}
                  {item.price.currency === 'stars' ? '⭐' : <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />}
                </BuyButton>
              </PremiumCard>
            ))}
          </PremiumGrid>
        )}


      </ShopContainer>
    </Screen>
  );
}
