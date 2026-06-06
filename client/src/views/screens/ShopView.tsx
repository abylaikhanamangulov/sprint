import styled from 'styled-components';
import { useShopViewModel } from '../../viewmodels/useShopViewModel';
import type { ShopTab } from '../../viewmodels/useShopViewModel';
import { Screen, Card, Button, Row, Column, Grid, Heading, Muted, Loader } from '../ui';

const TabBar = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
  padding-bottom: 4px;
`;

const Toast = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  text-align: center;
`;

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'deals', label: 'Скидки' },
  { id: 'crates', label: 'Кейсы' },
  { id: 'cosmetics', label: 'Тюнинг' },
  { id: 'nft', label: 'NFT' },
  { id: 'gold', label: 'Золото' },
];

export function ShopView() {
  const vm = useShopViewModel();

  if (vm.loading || !vm.shop) {
    return (
      <Loader />
    );
  }

  const shop = vm.shop;

  return (
    <Screen>
      <Heading style={{ marginBottom: 12 }}>Магазин</Heading>

      {vm.message && <Toast onClick={vm.clearMessage}>{vm.message}</Toast>}

      <TabBar>
        {TABS.map((t) => (
          <Button
            key={t.id}
            $size="sm"
            $variant={vm.tab === t.id ? 'primary' : 'outline'}
            onClick={() => vm.setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </TabBar>

      {vm.tab === 'deals' && shop.dailyDeal && (
        <Card style={{ background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 700, marginBottom: 8 }}>
            СКИДКА ДНЯ -{shop.dailyDeal.discount}%
          </div>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏎️</div>
          <h3 style={{ fontSize: 16 }}>{shop.dailyDeal.car.name}</h3>
          <div style={{ marginTop: 8 }}>
            <span style={{ textDecoration: 'line-through', color: '#8890a8', marginRight: 8 }}>
              {shop.dailyDeal.car.priceSilver?.toLocaleString()} 🪙
            </span>
            <span style={{ fontWeight: 700, color: '#2ed573', fontSize: 18 }}>
              {shop.dailyDeal.discountedPrice?.toLocaleString()} 🪙
            </span>
          </div>
        </Card>
      )}

      {vm.tab === 'crates' && (
        <Column $gap={10}>
          {shop.crates.map((crate) => (
            <Card key={crate.id}>
              <Row $justify="space-between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{crate.name}</div>
                  <Muted $size={11}>{crate.description}</Muted>
                </div>
                <Button $variant="primary" $size="sm" onClick={() => vm.buyCrate(crate.id)}>
                  {crate.price.currency === 'gold' ? '💎' : '🪙'} {crate.price.amount}
                </Button>
              </Row>
            </Card>
          ))}
        </Column>
      )}

      {vm.tab === 'cosmetics' && (
        <Grid $cols={2} $gap={10}>
          {shop.cosmetics.map((item) => (
            <Card key={item.id} style={{ textAlign: 'center' }}>
              {item.value && item.type === 'paint' ? (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: item.value,
                    margin: '0 auto 8px',
                    border: '2px solid #2a3050',
                  }}
                />
              ) : (
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎨</div>
              )}
              <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
              <Button
                $variant="primary"
                $size="sm"
                style={{ marginTop: 8 }}
                onClick={() => vm.buyCosmetic(item.id)}
              >
                {item.price.currency === 'gold' ? '💎' : '🪙'} {item.price.amount}
              </Button>
            </Card>
          ))}
        </Grid>
      )}

      {vm.tab === 'nft' && (
        <Column $gap={10}>
          {shop.nftDrops.map((nft) => (
            <Card
              key={nft.id}
              style={{ background: 'linear-gradient(135deg, #1a2a1a, #2a1a2a)', border: '1px solid #ffd700' }}
            >
              <Row $justify="space-between">
                <div>
                  <div style={{ fontWeight: 700 }}>{nft.name}</div>
                  <Muted $size={11}>{nft.description}</Muted>
                  <div style={{ fontSize: 11, marginTop: 8, color: '#ffa502' }}>
                    Осталось: {nft.remaining}/{nft.totalEditions}
                  </div>
                </div>
                <Button $variant="gold" $size="sm">
                  {nft.priceTon} TON
                </Button>
              </Row>
            </Card>
          ))}
        </Column>
      )}

      {vm.tab === 'gold' && (
        <Column $gap={10}>
          {shop.goldPackages.map((pkg) => (
            <Card key={pkg.id}>
              <Row $justify="space-between">
                <div>
                  <div style={{ fontWeight: 600 }}>💎 {pkg.gold} золота</div>
                  <Muted $size={11}>{pkg.name}</Muted>
                </div>
                <Column $gap={4}>
                  <Button $variant="primary" $size="sm" onClick={() => vm.buyGold(pkg.id)}>
                    ⭐ {pkg.priceStars}
                  </Button>
                  <Button $variant="gold" $size="sm" style={{ fontSize: 10 }}>
                    {pkg.priceTon} TON
                  </Button>
                </Column>
              </Row>
            </Card>
          ))}
        </Column>
      )}
    </Screen>
  );
}
