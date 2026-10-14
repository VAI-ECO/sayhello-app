/**
 * The points badge on What's Happening: this account's real balance from GET /points/balance
 * ("Balance IS drawing entries — one pool"). Until the server answers — or if it cannot — the badge
 * shows "—", never a stand-in number: a made-up figure on the home screen would be a lie about the
 * drawing weight. Re-read whenever the tab regains focus (points move when a Hello is answered).
 */

import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getPointsBalance } from '../api/points';

export function usePointsBalance(): number | null {
  const [balance, setBalance] = useState<number | null>(null);
  const loadId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const id = ++loadId.current;
      (async () => {
        let res: Awaited<ReturnType<typeof getPointsBalance>> | undefined;
        try {
          res = await getPointsBalance();
        } catch {
          res = undefined;
        }
        if (id !== loadId.current) return;
        // A failed read keeps the last real number rather than replacing it with a guess.
        if (res?.data && Number.isFinite(res.data.balance)) setBalance(res.data.balance);
      })();
    }, [])
  );

  return balance;
}
