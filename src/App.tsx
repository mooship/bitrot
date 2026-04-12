import { useEffect } from "react";
import { EntryDetail } from "./components/EntryDetail/EntryDetail";
import { FilterBar } from "./components/FilterBar/FilterBar";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { PrivacyPolicy } from "./components/PrivacyPolicy/PrivacyPolicy";
import { SkipLink } from "./components/SkipLink/SkipLink";
import { Timeline } from "./components/Timeline/Timeline";
import { entries } from "./data/entries";
import { useHashRoute } from "./hooks/useHashRoute";
import { useFilteredEntries } from "./stores/useFilterStore";
import { usePourStore } from "./stores/usePourStore";

export default function App() {
  const fetchPours = usePourStore((s) => s.fetchPours);
  const filteredEntries = useFilteredEntries();
  const { route, navigateTo } = useHashRoute();

  const activeEntryId = route.page === "home" ? route.entryId : null;
  const activeEntry = activeEntryId ? (entries.find((e) => e.id === activeEntryId) ?? null) : null;

  useEffect(() => {
    if (route.page === "home") {
      fetchPours();
    }
  }, [fetchPours, route.page]);

  return (
    <>
      <SkipLink />
      <Header />
      {route.page === "home" && (
        <>
          <FilterBar />
          <main id="main-content">
            <Timeline entries={filteredEntries} onSelect={navigateTo} />
          </main>
          <EntryDetail entry={activeEntry} onClose={() => navigateTo(null)} />
        </>
      )}
      {route.page === "privacy" && (
        <main id="main-content">
          <PrivacyPolicy />
        </main>
      )}
      <Footer />
    </>
  );
}
