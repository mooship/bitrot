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
    if (id) {
      window.location.hash = `/entry/${id}`;
    } else {
      history.pushState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, []);

  return { activeEntryId, navigateTo };
}
