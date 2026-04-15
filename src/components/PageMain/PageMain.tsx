import type { ReactNode } from "react";

interface PageMainProps {
  children: ReactNode;
}

export function PageMain({ children }: PageMainProps) {
  return <main id="main-content">{children}</main>;
}
