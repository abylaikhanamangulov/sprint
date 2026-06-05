import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { getErrorMessage } from '../models/errors';
import { useGameStore } from '../models/store';
import type { ClanDetail, ClanListItem, ClanWarState, CreateClanForm } from '../models/types';

export type ClanTab = 'members' | 'chat' | 'wars';

interface ClanViewModel {
  clan: ClanDetail | null;
  clanList: ClanListItem[];
  warState: ClanWarState | null;
  loading: boolean;
  tab: ClanTab;
  creating: boolean;
  form: CreateClanForm;
  chatText: string;
  error: string | null;
  hasClan: boolean;
  setTab: (t: ClanTab) => void;
  setCreating: (v: boolean) => void;
  setForm: (f: CreateClanForm) => void;
  setChatText: (t: string) => void;
  joinClan: (id: number) => Promise<void>;
  leaveClan: () => Promise<void>;
  createClan: () => Promise<void>;
  sendMessage: () => Promise<void>;
  donate: (amount: number) => Promise<void>;
  raceWarGhost: () => void;
}

export function useClanViewModel(): ClanViewModel {
  const { user, fetchUser, setScreen, setPendingWar } = useGameStore();
  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [clanList, setClanList] = useState<ClanListItem[]>([]);
  const [warState, setWarState] = useState<ClanWarState | null>(null);
  const [tab, setTab] = useState<ClanTab>('members');
  const [chatText, setChatText] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateClanForm>({ name: '', tag: '', privacy: 'open' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.clanId) {
      api.clans.get(user.clanId).then((data) => {
        setClan(data);
        setLoading(false);
      });
      api.clans.war(user.clanId).then(setWarState).catch(() => setWarState(null));
    } else {
      api.clans.list().then((data) => {
        setClanList(data);
        setLoading(false);
      });
    }
  }, [user?.clanId]);

  const raceWarGhost = () => {
    if (!warState || !warState.ghost || !warState.warId) return;
    setPendingWar({ clanId: warState.clanId, warId: warState.warId, ghost: warState.ghost });
    setScreen('race');
  };

  const joinClan = async (id: number) => {
    await api.clans.join(id);
    await fetchUser();
  };

  const leaveClan = async () => {
    if (!clan) return;
    await api.clans.leave(clan.id);
    setClan(null);
    await fetchUser();
  };

  const createClan = async () => {
    try {
      await api.clans.create(form);
      setCreating(false);
      await fetchUser();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const sendMessage = async () => {
    if (!chatText.trim() || !clan) return;
    await api.clans.chat(clan.id, chatText);
    setChatText('');
    const updated = await api.clans.get(clan.id);
    setClan(updated);
  };

  const donate = async (amount: number) => {
    if (!clan) return;
    try {
      await api.clans.donate(clan.id, amount);
      const updated = await api.clans.get(clan.id);
      setClan(updated);
      await fetchUser();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  return {
    clan,
    clanList,
    warState,
    loading,
    tab,
    creating,
    form,
    chatText,
    error,
    hasClan: !!user?.clanId,
    setTab,
    setCreating,
    setForm,
    setChatText,
    joinClan,
    leaveClan,
    createClan,
    sendMessage,
    donate,
    raceWarGhost,
  };
}
