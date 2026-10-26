import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface LiveServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string;
  source: 'api' | 'fallback';
  lastUpdated: Date;
}

export function useServerStatus(): LiveServerStatus {
  const settings = useAppStore((s) => s.db.settings);
  const [status, setStatus] = useState<LiveServerStatus>(() => ({
    online: true,
    playersOnline: settings.fallbackOnlinePlayers,
    playersMax: settings.fallbackMaxPlayers,
    version: settings.javaVersion,
    source: 'fallback',
    lastUpdated: new Date(),
  }));

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      if (!settings.statusApiEnabled) {
        if (mounted) {
          setStatus({
            online: true,
            playersOnline: settings.fallbackOnlinePlayers,
            playersMax: settings.fallbackMaxPlayers,
            version: settings.javaVersion,
            source: 'fallback',
            lastUpdated: new Date(),
          });
        }
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      try {
        const res = await fetch(
          `https://api.mcsrvstat.us/3/${encodeURIComponent(settings.serverIp || 'adrenalinee.run')}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Non-200 status');
        const data = await res.json();

        if (!mounted) return;
        if (data && data.online === true && data.players) {
          setStatus({
            online: true,
            playersOnline:
              typeof data.players.online === 'number' && data.players.online > 0
                ? data.players.online
                : settings.fallbackOnlinePlayers,
            playersMax:
              typeof data.players.max === 'number' && data.players.max > 0
                ? data.players.max
                : settings.fallbackMaxPlayers,
            version: data.version || settings.javaVersion,
            source: 'api',
            lastUpdated: new Date(),
          });
        } else {
          // Graceful fallback to admin-configured numbers so the live showcase remains informative
          setStatus({
            online: true,
            playersOnline: settings.fallbackOnlinePlayers,
            playersMax: settings.fallbackMaxPlayers,
            version: settings.javaVersion,
            source: 'fallback',
            lastUpdated: new Date(),
          });
        }
      } catch {
        clearTimeout(timeout);
        if (mounted) {
          setStatus({
            online: true,
            playersOnline: settings.fallbackOnlinePlayers,
            playersMax: settings.fallbackMaxPlayers,
            version: settings.javaVersion,
            source: 'fallback',
            lastUpdated: new Date(),
          });
        }
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [
    settings.serverIp,
    settings.statusApiEnabled,
    settings.fallbackOnlinePlayers,
    settings.fallbackMaxPlayers,
    settings.javaVersion,
  ]);

  return status;
}
