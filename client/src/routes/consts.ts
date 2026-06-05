export const defaultAccess: string[] = [];

export const AUTH_ACCESS = 'PRIVATE';

export const MAPPING = Object.freeze({
  MAIN: { path: '/', access: [AUTH_ACCESS] },
  HUB: { path: '/hub', access: [AUTH_ACCESS] },
  GARAGE: { path: '/garage', access: [AUTH_ACCESS] },
  EVENTS: { path: '/events', access: [AUTH_ACCESS] },
  CLAN: { path: '/clan', access: [AUTH_ACCESS] },
  SHOP: { path: '/shop', access: [AUTH_ACCESS] },
  PROFILE: { path: '/profile', access: [AUTH_ACCESS] },
  SETTINGS: { path: '/settings', access: [AUTH_ACCESS] },
  NOTIFICATIONS: { path: '/notifications', access: [AUTH_ACCESS] },
  
  RACE: { path: '/race', access: [AUTH_ACCESS] },
  CAMPAIGN: { path: '/campaign', access: [AUTH_ACCESS] },

  ROOT_REDIRECT: { path: '/', access: defaultAccess },
  NOT_FOUND: { path: '*', access: defaultAccess },
});
