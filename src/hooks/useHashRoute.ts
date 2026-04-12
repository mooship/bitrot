import { useCallback, useSyncExternalStore } from "react";

function parseHash(hash: string): string | null {
  const match = /^#\/entry\/(.+)$/.exec(hash);
  return match ? match[1] : null;
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

function getSnapshot() {
  return window.location.hash;
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const activeEntryId = parseHash(hash);

  const navigateTo = useCallback((id: string | null) => {
    window.location.hash = id ? `/entry/${id}` : "";
  }, []);

  return { activeEntryId, navigateTo };
}
