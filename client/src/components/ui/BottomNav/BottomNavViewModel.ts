import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from 'src/routes/paths';
import { Wrench, Flag, Home, Trophy, Shield } from 'lucide-react';
import React from 'react';

export interface BottomNavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
}

export const useBottomNavViewModel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: BottomNavItem[] = [
    { id: 'garage', path: PATHS.GARAGE, label: 'Гараж', icon: Wrench },
    { id: 'race', path: PATHS.RACE, label: 'Гонка', icon: Flag },
    { id: 'hub', path: PATHS.HUB, label: 'Меню', icon: Home },
    { id: 'events', path: PATHS.EVENTS, label: 'Турниры', icon: Trophy },
    { id: 'clan', path: PATHS.CLAN, label: 'Клан', icon: Shield },
  ];

  // Exact match for hub to prevent it from matching /hub/something else if needed, 
  // but startsWith for others to keep active state in sub-routes.
  const activeTabId = tabs.find(t => 
    (t.path === PATHS.HUB && location.pathname === PATHS.HUB) || 
    (t.path !== PATHS.HUB && location.pathname.startsWith(t.path))
  )?.id || 'hub';

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return {
    tabs,
    activeTabId,
    handleTabClick
  };
};
