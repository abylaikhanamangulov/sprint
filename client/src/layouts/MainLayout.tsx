import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, AppMain } from 'src/views/AppShell';
import { BottomNav } from 'src/components/ui/BottomNav/BottomNav';

import { GlobalTopBar } from 'src/components/ui/GlobalTopBar/GlobalTopBar';

export const MainLayout = () => {
  const location = useLocation();

  return (
    <>
      <GlobalTopBar />
      <AppMain>
        <Outlet />
      </AppMain>
      <BottomNav />
    </>
  );
};
