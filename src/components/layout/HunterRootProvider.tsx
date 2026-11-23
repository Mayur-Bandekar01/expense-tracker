"use client";

import React from "react";
import { AuthProvider } from "../../lib/contexts/AuthContext";
import { TransactionProvider } from "../../lib/contexts/TransactionContext";
import { BudgetProvider } from "../../lib/contexts/BudgetContext";
import { GoalsProvider } from "../../lib/contexts/GoalsContext";
import { PactsProvider } from "../../lib/contexts/PactsContext";
import { SpheresProvider } from "../../lib/contexts/SpheresContext";
import { UIProvider } from "../../lib/contexts/UIContext";
import { ThemeProvider } from "../../lib/themeContext";
import { StatusLayout } from "./StatusLayout";
import { AuthGate } from "../auth/AuthGate";

export function HunterRootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <BudgetProvider>
            <GoalsProvider>
              <PactsProvider>
                <SpheresProvider>
                  <UIProvider>
                    <AuthGate>
                      <StatusLayout>{children}</StatusLayout>
                    </AuthGate>
                  </UIProvider>
                </SpheresProvider>
              </PactsProvider>
            </GoalsProvider>
          </BudgetProvider>
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}