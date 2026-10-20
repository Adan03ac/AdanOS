import { useCallback, useRef, useEffect, useState } from 'react';
export function useOperation() {
  const [error, setError] = useState(''); const [pending, setPending] = useState(false); const [success, setSuccess] = useState('');
  const alive = useRef(true); const running = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const run = useCallback(async (operation: () => Promise<unknown>, message = '') => {
    if (running.current) return false; running.current = true; setPending(true); setError(''); setSuccess('');
    try { await operation(); if (alive.current) setSuccess(message); return true; }
    catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'The operation failed. Please try again.'); return false; }
    finally { running.current = false; if (alive.current) setPending(false); }
  }, []);
  return { error, pending, success, run, setError, setSuccess };
}
