import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { initialState, transition, type Action, type State } from '@domain/model';

type Result = { ok: true; state: State } | { ok: false; error: string };
type Prototype = { state: State; act: (action: Action, success?: string) => Result; notice: string; notify: (message: string) => void; dismiss: () => void };
const Context = createContext<Prototype | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [notice, setNotice] = useState('');
  const current = useRef(state);
  const act = useCallback((action: Action, success?: string): Result => {
    try {
      const next = transition(current.current, action);
      current.current = next;
      setState(next);
      if (success) setNotice(success);
      return { ok: true, state: next };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setNotice(message);
      return { ok: false, error: message };
    }
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (current.current.bookings.some(b => b.status === 'held' && b.expiresAt <= now) || current.current.waitlist.some(w => w.status === 'offered' && (w.expiresAt ?? 0) <= now)) act({ type: 'tick' });
    }, 1000);
    return () => clearInterval(timer);
  }, [act]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  return <Context.Provider value={{ state, act, notice, notify: setNotice, dismiss: () => setNotice('') }}>{children}</Context.Provider>;
}

export function usePrototype() {
  const context = useContext(Context);
  if (!context) throw new Error('PrototypeProvider is required.');
  return context;
}
