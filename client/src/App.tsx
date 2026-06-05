import { useGameStore } from './models/store';
import { useAppViewModel } from './viewmodels/useAppViewModel';
import { AppShell, AppMain } from './views/AppShell';
import { TopBar } from './views/components/TopBar';
import { BottomNav } from './views/components/BottomNav';
import { ScreenTransition } from './views/components/ScreenTransition';
import { Spinner, CenteredFill } from './views/ui';
import { SplashView } from './views/screens/SplashView';
import { WelcomeView } from './views/screens/WelcomeView';
import { HubView } from './views/screens/HubView';
import { GarageView } from './views/screens/GarageView';
import { RaceView } from './views/screens/RaceView';
import { CampaignView } from './views/screens/CampaignView';
import { EventsView } from './views/screens/EventsView';
import { ClanView } from './views/screens/ClanView';
import { ShopView } from './views/screens/ShopView';
import { ProfileView } from './views/screens/ProfileView';
import { SettingsView } from './views/screens/SettingsView';
import { NotificationsView } from './views/screens/NotificationsView';
import type { ComponentType } from 'react';
import type { ScreenId } from './models/store';

const SCREENS: Record<ScreenId, ComponentType> = {
  hub: HubView,
  garage: GarageView,
  race: RaceView,
  campaign: CampaignView,
  events: EventsView,
  clan: ClanView,
  shop: ShopView,
  profile: ProfileView,
  settings: SettingsView,
  notifications: NotificationsView,
};

function App() {
  const { stage, finishSplash, finishOnboarding } = useAppViewModel();
  const selectedScreen = useGameStore((s) => s.selectedScreen);

  const renderContent = () => {
    if (stage === 'splash') return <SplashView onDone={finishSplash} />;
    if (stage === 'loading') {
      return (
        <CenteredFill>
          <Spinner />
        </CenteredFill>
      );
    }
    if (stage === 'welcome') return <WelcomeView onDone={finishOnboarding} />;

    const ScreenComponent = SCREENS[selectedScreen] ?? HubView;
    const isRace = selectedScreen === 'race';
    return (
      <>
        <ScreenTransition />
        {!isRace && <TopBar />}
        <AppMain>
          <ScreenComponent />
        </AppMain>
        {!isRace && <BottomNav />}
      </>
    );
  };

  return <AppShell>{renderContent()}</AppShell>;
}

export default App;
