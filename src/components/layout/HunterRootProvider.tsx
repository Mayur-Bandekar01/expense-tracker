"use client";

import React from "react";
import { HunterProvider } from "../../lib/hunterContext";
import { ThemeProvider } from "../../lib/themeContext";
import { StatusLayout } from "./StatusLayout";
import { AuthGate } from "../auth/AuthGate";

export function HunterRootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HunterProvider>
        <AuthGate>
          <StatusLayout>{children}</StatusLayout>
        </AuthGate>
      </HunterProvider>
    </ThemeProvider>
  );
}

