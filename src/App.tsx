import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AboutPage } from "./components/AboutPage/AboutPage";
import { EntryDetail } from "./components/EntryDetail/EntryDetail";
import { FilterBar } from "./components/FilterBar/FilterBar";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { PageMain } from "./components/PageMain/PageMain";
import { PrivacyPolicy } from "./components/PrivacyPolicy/PrivacyPolicy";
import { SkipLink } from "./components/SkipLink/SkipLink";
import { StatsPage } from "./components/StatsPage/StatsPage";
import { Timeline } from "./components/Timeline/Timeline";
import { Toast } from "./components/Toast/Toast";
import { entryById } from "./data/entries";
import { useFilterUrlSync } from "./hooks/useFilterUrlSync";
import { useFilteredEntries, useFilterStore } from "./stores/useFilterStore";
import { usePourStore } from "./stores/usePourStore";

function HomePage() {
  const filteredEntries = useFilteredEntries();
  const sortOrder = useFilterStore((s) => s.sortOrder);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const activeEntry = id ? entryById(id) : null;

  useFilterUrlSync();

  return (
    <>
      <FilterBar />
      <PageMain>
        <Timeline
          entries={filteredEntries}
          sortOrder={sortOrder}
          onSelect={(entryId) => navigate(`/entry/${entryId}`)}
        />
      </PageMain>
      <EntryDetail entry={activeEntry} onClose={() => navigate("/")} />
    </>
  );
}

export default function App() {
  const fetchPours = usePourStore((s) => s.fetchPours);

  useEffect(() => {
    fetchPours();
  }, [fetchPours]);

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
            <PageMain>
              <PrivacyPolicy />
            </PageMain>
          }
        />
        <Route
          path="/about"
          element={
            <PageMain>
              <AboutPage />
            </PageMain>
          }
        />
        <Route
          path="/stats"
          element={
            <PageMain>
              <StatsPage />
            </PageMain>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <Toast />
    </>
  );
}
