import { useEffect } from "react";

export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaEl: HTMLMetaElement | null = null;
    let prevDescription: string | null = null;

    if (description !== undefined) {
      metaEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (metaEl) {
        prevDescription = metaEl.getAttribute("content");
        metaEl.setAttribute("content", description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (metaEl && prevDescription !== null) {
        metaEl.setAttribute("content", prevDescription);
      }
    };
  }, [title, description]);
}
