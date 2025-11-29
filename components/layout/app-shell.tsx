import type { ReactNode } from "react";
import { AppNav } from "@/components/layout/app-nav";

type AppShellProps = {
  children: ReactNode;
  activeProfileName?: string;
};

const AppShell = ({ children, activeProfileName }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav activeProfileName={activeProfileName} />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">{children}</main>
    </div>
  );
};

export default AppShell;
