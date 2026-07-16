import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="shell">
      <SiteHeader />
      {children}
    </main>
  );
}
