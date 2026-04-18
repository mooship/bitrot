import { useEffect } from "react";
import { type StaticPage, updatePageSeo } from "../utils/seo";

export function usePageSeo(page: StaticPage): void {
  useEffect(() => {
    updatePageSeo(page);
  }, [page]);
}
