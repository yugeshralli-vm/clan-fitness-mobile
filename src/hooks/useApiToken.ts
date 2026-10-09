import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef } from "react";

/**
 * A stable `getToken` for data hooks. Clerk's `useAuth().getToken` gets a new identity on every
 * render, so a `useCallback`/`useEffect` that lists it as a dependency re-runs every render — and
 * a fetch that sets state on completion turns that into an endless refetch loop. This keeps the
 * latest `getToken` in a ref and hands out one function that never changes.
 */
export type GetToken = (options?: { skipCache?: boolean }) => Promise<string | null>;

export function useApiToken(): GetToken {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  });
  return useCallback((options?: { skipCache?: boolean }) => getTokenRef.current(options), []);
}
