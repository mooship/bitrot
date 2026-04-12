import { useCallback, useSyncExternalStore } from "react";

type Route = { page: "home"; entryId: string | null } | { page: "privacy" };

function parseHash(hash: string): Route {
  if (hash === "#/privacy") {
    return { page: "privacy" };
  }
  const match = /^#\/entry\/(.+)$/.exec(hash);
  return { page: "home", entryId: match ? match[1] : null };
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
  const route = parseHash(hash);

  const activeEntryId = route.page === "home" ? route.entryId : null;

  const navigateTo = useCallback((id: string | null) => {
    if (id) {
      window.location.hash = `/entry/${id}`;
    } else {
      history.pushState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, []);

  return { route, activeEntryId, navigateTo };
}
