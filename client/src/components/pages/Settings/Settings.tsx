import styled from 'styled-components';
import { useSettingsViewModel } from 'src/components/pages/Settings/SettingsViewModel';
import type { GraphicsQuality, UserSettings } from 'src/models/types';
import { Screen, Card, Button, Row, Column, Heading, Muted, Select, Range, Toggle } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const GRAPHICS: { value: GraphicsQuality; label: string }[] = [
  { value: 'low', label: 'Низкое' },
  { value: 'medium', label: 'Среднее' },
  { value: 'high', label: 'Высокое' },
];

const TOGGLES: { key: keyof UserSettings; label: string }[] = [
  { key: 'soundEffects', label: 'Звуковые эффекты' },
  { key: 'music', label: 'Музыка' },
  { key: 'vibration', label: 'Вибрация' },
  { key: 'notifications', label: 'Уведомления' },
  { key: 'showFps', label: 'Показать FPS' },
];

export function SettingsView() {
  const vm = useSettingsViewModel();
  const s = vm.settings;

  return (
    <Screen>
      <MainHeader title="Настройки" showClose={true} onClose={vm.back} />

      <Card style={{ marginBottom: 12 }}>
        <SectionTitle>ИГРА</SectionTitle>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13 }}>Язык</label>
          <Select
            value={s.language}
            onChange={(e) => vm.update('language', e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="kz">Казахский</option>
            <option value="uz">Узбекский</option>
          </Select>
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Качество графики</label>
          <Row $gap={8} style={{ marginTop: 4 }}>
            {GRAPHICS.map((q) => (
              <Button
                key={q.value}
                $size="sm"
                $variant={s.graphicsQuality === q.value ? 'primary' : 'outline'}
                onClick={() => vm.update('graphicsQuality', q.value)}
              >
                {q.label}
              </Button>
            ))}
          </Row>
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionTitle>ЗВУК</SectionTitle>
        {TOGGLES.map((t) => (
          <ToggleRow key={t.key}>
            <span style={{ fontSize: 13 }}>{t.label}</span>
            <Toggle $on={!!s[t.key]} onClick={() => vm.update(t.key, !s[t.key] as never)} />
          </ToggleRow>
        ))}
        {s.music && (
          <div style={{ marginTop: 12 }}>
            <Row $justify="space-between" style={{ fontSize: 13, marginBottom: 8 }}>
              <span>Громкость</span>
              <span>{s.musicVolume}%</span>
            </Row>
            <Range
              min={0}
              max={100}
              step={5}
              value={s.musicVolume}
              onChange={(e) => vm.update('musicVolume', Number(e.target.value))}
            />
          </div>
        )}
      </Card>

      <Button $variant="primary" $block style={{ marginBottom: 12 }} onClick={vm.save} disabled={vm.saving}>
        {vm.saving ? 'Сохранение...' : vm.saved ? 'Сохранено ✓' : 'Сохранить'}
      </Button>

      <Card style={{ marginBottom: 12, padding: 12 }}>
        <Muted $size={11} style={{ display: 'block', textAlign: 'center' }}>
          Drag Racing v1.0.0
          <br />
          Telegram Mini App
        </Muted>
      </Card>

      <Button $variant="danger" $size="sm" $block style={{ opacity: 0.6 }}>
        Удалить аккаунт
      </Button>
    </Screen>
  );
}
