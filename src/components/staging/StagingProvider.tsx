"use client";

import { createContext, useContext } from "react";

const StagingContext = createContext(false);

export function StagingProvider({ staging, children }: { staging: boolean; children: React.ReactNode }) {
  return <StagingContext.Provider value={staging}>{children}</StagingContext.Provider>;
}

export function useMigrationStaging() {
  return useContext(StagingContext) || process.env.NEXT_PUBLIC_MIGRATION_STAGING === "1";
}
