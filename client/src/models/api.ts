import type {
  Car,
  Tuning,
  CarCosmetics,
  RaceResult,
  Tournament,
  TelegramLoginData,
  LoginResponse,
  DailyRewardResponse,
  MyCar,
  UpgradeCategoryView,
  UpgradeResult,
  PveRaceRequest,
  PveRaceResponse,
  CampaignChapterListItem,
  CampaignChapterDetail,
  ClanListItem,
  ClanDetail,
  Clan,
  CreateClanForm,
  ClanWarState,
  WarRaceResult,
  ShopData,
  CrateResult,
  ProfileData,
  LeaderboardEntry,
  Notification,
  UnreadCountResponse,
  SuccessResponse,
  UserSettings,
  User,
} from './types';

const BASE = '/api';

type JsonBody = Record<string, unknown>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: 'Ошибка сервера' }))) as {
      error?: string;
    };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

function post<T>(path: string, body?: JsonBody): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: JsonBody): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const api = {
  auth: {
    login: (data: TelegramLoginData) => post<LoginResponse>('/auth/login', { ...data }),
    me: () => get<User>('/auth/me'),
    selectStarter: (carId: number) =>
      post<{ success: boolean; carId: number }>('/auth/select-starter', { carId }),
    claimDaily: () => post<DailyRewardResponse>('/auth/daily-reward'),
  },
  cars: {
    list: () => get<Car[]>('/cars'),
    starters: () => get<Car[]>('/cars/starters'),
    get: (id: number) => get<Car>(`/cars/${id}`),
    buy: (id: number) => post<SuccessResponse>(`/cars/${id}/buy`),
  },
  garage: {
    myCars: () => get<MyCar[]>('/garage/my-cars'),
    select: (carId: number) =>
      post<{ success: boolean; selectedCarId: number }>(`/garage/select/${carId}`),
    upgrades: (carId: number) => get<UpgradeCategoryView[]>(`/garage/upgrades/${carId}`),
    upgrade: (carId: number, categoryId: string) =>
      post<UpgradeResult>('/garage/upgrade', { carId, categoryId }),
    getTuning: (carId: number) => get<Tuning>(`/garage/tuning/${carId}`),
    saveTuning: (carId: number, tuning: Tuning) =>
      post<SuccessResponse>(`/garage/tuning/${carId}`, { ...tuning }),
    getCosmetics: (carId: number) => get<CarCosmetics>(`/garage/cosmetics/${carId}`),
    saveCosmetics: (carId: number, cosmetics: CarCosmetics) =>
      post<SuccessResponse>(`/garage/cosmetics/${carId}`, { ...cosmetics }),
  },
  races: {
    pve: (data: PveRaceRequest) =>
      post<PveRaceResponse>('/races/pve', { ...data }),
    history: () => get<RaceResult[]>('/races/history'),
  },
  campaign: {
    chapters: () => get<CampaignChapterListItem[]>('/campaign/chapters'),
    chapter: (id: number) => get<CampaignChapterDetail>(`/campaign/chapters/${id}`),
  },
  clans: {
    list: () => get<ClanListItem[]>('/clans'),
    get: (id: number) => get<ClanDetail>(`/clans/${id}`),
    create: (data: CreateClanForm) => post<Clan>('/clans/create', { ...data }),
    join: (id: number) => post<SuccessResponse>(`/clans/${id}/join`),
    leave: (id: number) => post<SuccessResponse>(`/clans/${id}/leave`),
    donate: (id: number, amount: number) =>
      post<SuccessResponse>(`/clans/${id}/donate`, { amount }),
    chat: (id: number, text: string) =>
      post<SuccessResponse>(`/clans/${id}/chat`, { text }),
    war: (id: number) => get<ClanWarState>(`/clans/${id}/war`),
    warRace: (id: number, warId: number, playerTime: number, ghostTime: number) =>
      post<WarRaceResult>(`/clans/${id}/war/race`, { warId, playerTime, ghostTime }),
  },
  tournaments: {
    list: () => get<Tournament[]>('/tournaments'),
    active: () => get<Tournament[]>('/tournaments/active'),
    get: (id: number) => get<Tournament>(`/tournaments/${id}`),
    join: (id: number) => post<SuccessResponse>(`/tournaments/${id}/join`),
  },
  shop: {
    get: () => get<ShopData>('/shop'),
    buyCosmetic: (id: string) =>
      post<SuccessResponse>('/shop/buy-cosmetic', { cosmeticId: id }),
    buyCrate: (id: string) => post<CrateResult>('/shop/buy-crate', { crateId: id }),
    buyCoins: (packageId: string, method: string) =>
      post<{ success: boolean; coinsAdded: number; paymentMethod: string }>(
        '/shop/buy-coins',
        { packageId, paymentMethod: method }
      ),
  },
  profile: {
    get: () => get<ProfileData>('/profile'),
    updateSettings: (settings: Partial<UserSettings>) =>
      put<SuccessResponse>('/profile/settings', { ...settings }),
    leaderboard: () => get<LeaderboardEntry[]>('/profile/leaderboard'),
  },
  notifications: {
    list: () => get<Notification[]>('/notifications'),
    unreadCount: () => get<UnreadCountResponse>('/notifications/unread-count'),
    read: (id: number) => post<SuccessResponse>(`/notifications/${id}/read`),
    readAll: () => post<SuccessResponse>('/notifications/read-all'),
  },
  admin: {
    users: () => get<User[]>('/admin/users'),
  },
};
