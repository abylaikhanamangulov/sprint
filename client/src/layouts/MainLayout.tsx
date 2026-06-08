import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, AppMain } from 'src/views/AppShell';
import { BottomNav } from 'src/components/ui/BottomNav/BottomNav';
import { ScreenTransition } from 'src/views/components/ScreenTransition';

export const MainLayout = () => {
  const location = useLocation();

  return (
    <>
      <ScreenTransition />
      <AppMain>
        <Outlet />
      </AppMain>
      <BottomNav />
    </>
  );
};
