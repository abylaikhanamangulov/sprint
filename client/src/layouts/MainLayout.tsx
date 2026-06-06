import { Outlet } from 'react-router-dom';
import { AppShell, AppMain } from 'src/views/AppShell';
import { TopBar } from 'src/views/components/TopBar';
import { BottomNav } from 'src/components/ui/BottomNav/BottomNav';
import { ScreenTransition } from 'src/views/components/ScreenTransition';

export const MainLayout = () => {
  return (
    <>
      <ScreenTransition />
      <TopBar />
      <AppMain>
        <Outlet />
      </AppMain>
      <BottomNav />
    </>
  );
};
