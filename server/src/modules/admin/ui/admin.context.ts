export type AdminState = 
  | 'AUTHENTICATED'
  // Users
  | 'WAITING_USER_SEARCH'
  | 'WAITING_USER_ADD_COINS'
  | 'WAITING_USER_REMOVE_COINS'
  | 'WAITING_USER_ADD_XP'
  | 'WAITING_USER_REMOVE_XP'
  | 'WAITING_USER_SET_LEVEL'
  | 'WAITING_USER_GIVE_CAR'
  | 'WAITING_USER_REMOVE_CAR'
  | 'WAITING_USER_GIVE_ACH'
  // Clans
  | 'WAITING_CLAN_SEARCH'
  | 'WAITING_CLAN_NEW_NAME'
  | 'WAITING_CLAN_NEW_TAG'
  | 'WAITING_CLAN_NEW_LEADER'
  | 'WAITING_CLAN_KICK_MEMBER'
  | 'WAITING_CLAN_ADD_XP'
  // System
  | 'WAITING_BROADCAST_MESSAGE';

export interface AdminContext {
  state: AdminState;
  targetUserId?: number;
  targetClanId?: number;
  targetCarId?: number;
}

const sessions: Record<number, AdminContext> = {};

export function getAdminContext(userId: number): AdminContext {
  if (!sessions[userId]) {
    sessions[userId] = { state: 'AUTHENTICATED' };
  }
  return sessions[userId];
}

export function setAdminState(userId: number, state: AdminState, payload: Partial<AdminContext> = {}) {
  const ctx = getAdminContext(userId);
  sessions[userId] = { ...ctx, ...payload, state };
}

export function clearAdminState(userId: number) {
  if (sessions[userId]) {
    sessions[userId].state = 'AUTHENTICATED';
  }
}
