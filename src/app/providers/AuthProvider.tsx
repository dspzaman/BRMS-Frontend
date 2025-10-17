// src/app/providers/AuthProvider.tsx
import { AuthProvider as PBRSAuthProvider } from "@/shared/contexts/AuthContext";

/**
 * App-level AuthProvider wrapper.
 * 
 * Purpose:
 * - Keeps provider imports in one centralized place.
 * - Allows stacking multiple providers later (Theme, QueryClient, etc.)
 * - Keeps App.tsx clean.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <PBRSAuthProvider>{children}</PBRSAuthProvider>;
}
