import { Navigate } from 'react-router-dom';

import { MainLayout } from 'src/layouts/MainLayout';
import { HubView } from 'src/components/pages/Hub/Hub';
import { GarageView } from 'src/components/pages/Garage/Garage';
import { RaceView } from 'src/components/pages/Race/Race';
import { CampaignView } from 'src/components/pages/Campaign/Campaign';
import { EventsView } from 'src/components/pages/Events/Events';
import { ClanView } from 'src/components/pages/Clan/Clan';
import { ShopView } from 'src/components/pages/Shop/Shop';
import { Profile } from 'src/components/pages/Profile';
import { SettingsView } from 'src/components/pages/Settings/Settings';
import { NotificationsView } from 'src/components/pages/Notifications/Notifications';
import { CoinShopView } from 'src/components/pages/CoinShop/CoinShop';

import { VIEWS, getPath } from './paths';
import { RenderRoutesInnerProps, RouteData } from './types';

export const routes: RouteData[] = [
  {
    view: 'MAIN',
    render: () => <MainLayout />,
    routes: [
      { view: 'HUB', component: <HubView /> },
      { view: 'GARAGE', component: <GarageView /> },
      { view: 'EVENTS', component: <EventsView /> },
      { view: 'CLAN', component: <ClanView /> },
      { view: 'SHOP', component: <ShopView /> },
      { view: 'COIN_SHOP', component: <CoinShopView /> },
      { view: 'PROFILE', component: <Profile /> },
      { view: 'SETTINGS', component: <SettingsView /> },
      { view: 'NOTIFICATIONS', component: <NotificationsView /> },
      { view: 'CAMPAIGN', component: <CampaignView /> },
    ],
  },
  {
    view: 'RACE',
    component: <RaceView />, 
  },
  {
    view: 'ROOT_REDIRECT',
    component: <Navigate to={getPath({ view: VIEWS.HUB })} replace />,
  },
  {
    view: 'NOT_FOUND',
    component: <Navigate to={getPath({ view: VIEWS.HUB })} replace />,
  },
];
