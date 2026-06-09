import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, AppMain } from 'src/views/AppShell';
import { BottomNav } from 'src/components/ui/BottomNav/BottomNav';

export const MainLayout = () => {
  const location = useLocation();

  return (
    <>
      <AppMain>
        <Outlet />
      </AppMain>
      <BottomNav />
    </>
  );
};
