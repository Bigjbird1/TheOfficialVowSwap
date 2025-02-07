"use client";

import { SessionProvider } from "next-auth/react";
import { RegistryProvider } from "./contexts/RegistryContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RegistryProvider>
        {children}
      </RegistryProvider>
    </SessionProvider>
  );
}
