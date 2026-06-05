import { Navigate } from 'react-router-dom';

import { MainLayout } from 'src/layouts/MainLayout';
import { HubView } from 'src/views/screens/HubView';
import { GarageView } from 'src/views/screens/GarageView';
import { RaceView } from 'src/views/screens/RaceView';
import { CampaignView } from 'src/views/screens/CampaignView';
import { EventsView } from 'src/views/screens/EventsView';
import { ClanView } from 'src/views/screens/ClanView';
import { ShopView } from 'src/views/screens/ShopView';
import { ProfileView } from 'src/views/screens/ProfileView';
import { SettingsView } from 'src/views/screens/SettingsView';
import { NotificationsView } from 'src/views/screens/NotificationsView';

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
      { view: 'PROFILE', component: <ProfileView /> },
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
