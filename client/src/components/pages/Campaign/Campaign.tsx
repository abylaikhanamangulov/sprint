import styled from 'styled-components';
import { useCampaignViewModel } from 'src/viewmodels/useCampaignViewModel';
import { Screen, Card, Button, Row, Column, Heading, Muted, Stars, ProgressBar, ProgressFill, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const NodeCard = styled(Card)<{ $boss: boolean; $available: boolean }>`
  opacity: ${({ $available }) => ($available ? 1 : 0.5)};
  border-left: 3px solid ${({ $boss, theme }) => ($boss ? theme.colors.red : theme.colors.border)};
`;

export function CampaignView() {
  const vm = useCampaignViewModel();

  if (vm.loading) {
    return (
      <Loader />
    );
  }

  if (vm.selectedChapter) {
    const ch = vm.selectedChapter;
    return (
      <Screen>
        <MainHeader title={ch.name} showClose={true} onClose={vm.closeChapter} />
        <Column $gap={8}>
          {ch.nodes.map((node) => (
            <NodeCard key={node.id} $boss={node.type === 'boss'} $available={node.isAvailable}>
              <Row $justify="space-between" $align="flex-start">
                <div>
                  <Row $gap={8}>
                    <span style={{ fontSize: 16 }}>{node.type === 'boss' ? '💀' : '🏁'}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {node.type === 'boss' ? node.bossName : node.opponentCar.name}
                    </span>
                  </Row>
                  <Muted $size={11}>
                    PP рек.: {node.recommendedPP} · ⚡{node.energyCost}
                  </Muted>
                  {node.type === 'boss' && node.bossDialogue && (
                    <div style={{ fontSize: 11, fontStyle: 'italic', color: '#ffa502', marginTop: 4 }}>
                      "{node.bossDialogue}"
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {node.completed ? (
                    <Stars>
                      {'★'.repeat(node.stars)}
                      {'☆'.repeat(3 - node.stars)}
                    </Stars>
                  ) : node.isAvailable ? (
                    <Button $variant="primary" $size="sm" onClick={vm.goRace}>
                      Гонять
                    </Button>
                  ) : (
                    <span style={{ fontSize: 20 }}>🔒</span>
                  )}
                  <Muted $size={11} style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <img src={coinIcon} alt="coin" style={{ width: 12, height: 12 }} /> {node.rewards.coins} · {node.rewards.xp}XP
                  </Muted>
                </div>
              </Row>
            </NodeCard>
          ))}
        </Column>
      </Screen>
    );
  }

  return (
    <Screen>
      <MainHeader title="Кампания" subtitle={`⚡ ${vm.energy}/${vm.maxEnergy}`} />
      <Column $gap={12}>
        {vm.chapters.map((chapter) => (
          <Card
            key={chapter.id}
            $clickable={chapter.isUnlocked}
            onClick={() => chapter.isUnlocked && vm.openChapter(chapter.id)}
            style={{ opacity: chapter.isUnlocked ? 1 : 0.5 }}
          >
            <Row $justify="space-between">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {chapter.isUnlocked ? '📍' : '🔒'} {chapter.name}
                </h3>
                <Muted $size={11}>
                  {chapter.completedNodes}/{chapter.totalNodes} уровней ·{' '}
                  <Stars>{'★'.repeat(chapter.totalStars)}</Stars>/{chapter.maxStars}
                </Muted>
              </div>
              {chapter.isUnlocked && chapter.totalNodes > 0 && <span style={{ fontSize: 20 }}>▶</span>}
              {chapter.totalNodes === 0 && chapter.isUnlocked && <Muted $size={11}>Скоро</Muted>}
            </Row>
            {chapter.isUnlocked && chapter.totalNodes > 0 && (
              <ProgressBar style={{ marginTop: 8 }}>
                <ProgressFill
                  $pct={(chapter.completedNodes / chapter.totalNodes) * 100}
                  $bg="#2ed573"
                />
              </ProgressBar>
            )}
          </Card>
        ))}
      </Column>
    </Screen>
  );
}
