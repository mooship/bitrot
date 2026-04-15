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
import { Timeline } from "./components/Timeline/Timeline";
import { entryById } from "./data/entries";
import { useFilterUrlSync } from "./hooks/useFilterUrlSync";
import { useFilteredEntries } from "./stores/useFilterStore";
import { usePourStore } from "./stores/usePourStore";

function HomePage() {
  const fetchPours = usePourStore((s) => s.fetchPours);
  const filteredEntries = useFilteredEntries();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const activeEntry = id ? entryById(id) : null;

  useFilterUrlSync();

  useEffect(() => {
    fetchPours();
  }, [fetchPours]);

  return (
    <>
      <FilterBar />
      <PageMain>
        <Timeline entries={filteredEntries} onSelect={(entryId) => navigate(`/entry/${entryId}`)} />
      </PageMain>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
