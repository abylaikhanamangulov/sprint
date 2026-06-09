import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { getErrorMessage } from 'src/models/errors';
import type { Tournament } from 'src/models/types';

interface EventsViewModel {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  join: (id: number) => Promise<void>;
}

export function useEventsViewModel(): EventsViewModel {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.tournaments.list().then((data) => {
      setTournaments(data);
      setLoading(false);
    });
  }, []);

  const join = async (id: number) => {
    try {
      await api.tournaments.join(id);
      const updated = await api.tournaments.list();
      setTournaments(updated);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  return { tournaments, loading, error, join };
}
