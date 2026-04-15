import { useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "error";

export interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

interface Result {
  canShare: boolean;
  copyState: CopyState;
  share: (data: ShareData) => Promise<void>;
}

export function useShareOrCopy(): Result {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canShare = typeof navigator.share === "function";

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  async function share(data: ShareData) {
    if (canShare) {
      try {
        await navigator.share(data);
      } catch {
        // Web Share rejection is canonical for user-cancelled; no feedback needed.
      }
      return;
    }
    let nextState: CopyState;
    try {
      await navigator.clipboard.writeText(data.url);
      nextState = "copied";
    } catch {
      nextState = "error";
    }
    setCopyState(nextState);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
  }

  return { canShare, copyState, share };
}
