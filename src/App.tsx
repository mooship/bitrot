import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { EntryDetail } from "./components/EntryDetail/EntryDetail";
import { FilterBar } from "./components/FilterBar/FilterBar";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { PrivacyPolicy } from "./components/PrivacyPolicy/PrivacyPolicy";
import { SkipLink } from "./components/SkipLink/SkipLink";
import { Timeline } from "./components/Timeline/Timeline";
import { entries } from "./data/entries";
import { useFilteredEntries } from "./stores/useFilterStore";
import { usePourStore } from "./stores/usePourStore";

function HomePage() {
  const fetchPours = usePourStore((s) => s.fetchPours);
  const filteredEntries = useFilteredEntries();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const activeEntry = id ? (entries.find((e) => e.id === id) ?? null) : null;

  useEffect(() => {
    fetchPours();
  }, [fetchPours]);

  return (
    <>
      <FilterBar />
      <main id="main-content">
        <Timeline entries={filteredEntries} onSelect={(entryId) => navigate(`/entry/${entryId}`)} />
      </main>
      <EntryDetail entry={activeEntry} onClose={() => navigate("/")} />
    </>
  );
}

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entry/:id" element={<HomePage />} />
        <Route
          path="/privacy"
          element={
            <main id="main-content">
              <PrivacyPolicy />
            </main>
          }
        />
        <Route
          path="/about"
          element={
            <main id="main-content">
              <div>About</div>
            </main>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
