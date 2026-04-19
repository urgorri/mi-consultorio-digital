import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { mockClinics } from "@/services/api/mockData";
import type { Clinic } from "@/services/api/types";

/**
 * Global clinic filter. Applies across patients, agenda, consultations, etc.
 * - selectedClinicIds = []  → show ALL data (private + every clinic the professional belongs to)
 * - selectedClinicIds includes "private" → include private records
 * - selectedClinicIds includes a clinic id → include that clinic's records
 */
export const PRIVATE_SCOPE = "private" as const;
export type ScopeId = string; // clinic id or "private"

interface ClinicFilterContextType {
  /** Clinics the professional belongs to (memberships). */
  availableClinics: Clinic[];
  /** Currently selected scopes. Empty = "Todo". */
  selectedScopes: ScopeId[];
  setSelectedScopes: (s: ScopeId[]) => void;
  toggleScope: (s: ScopeId) => void;
  clearScopes: () => void;
  /** Returns true when the entity (with given clinicId / private flag) matches the active filter. */
  matchesFilter: (params: { clinicIds?: string[]; clinicId?: string | null; isPrivate?: boolean }) => boolean;
  /** Look up a clinic by id (only those the professional belongs to). */
  getClinic: (id: string | null | undefined) => Clinic | undefined;
}

const ClinicFilterContext = createContext<ClinicFilterContextType | undefined>(undefined);

export const ClinicFilterProvider = ({ children }: { children: ReactNode }) => {
  // Mock: assume the logged-in professional belongs to all mock clinics.
  // When backend is connected, derive this from professional.clinicMemberships.
  const availableClinics = mockClinics;
  const [selectedScopes, setSelectedScopes] = useState<ScopeId[]>([]);

  const toggleScope = (s: ScopeId) => {
    setSelectedScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const clearScopes = () => setSelectedScopes([]);

  const value = useMemo<ClinicFilterContextType>(() => ({
    availableClinics,
    selectedScopes,
    setSelectedScopes,
    toggleScope,
    clearScopes,
    matchesFilter: ({ clinicIds, clinicId, isPrivate }) => {
      if (selectedScopes.length === 0) return true; // "Todo"
      const ids = clinicIds ?? (clinicId ? [clinicId] : []);
      const isPriv = isPrivate ?? (clinicId === null);
      if (selectedScopes.includes(PRIVATE_SCOPE) && isPriv) return true;
      return ids.some(id => selectedScopes.includes(id));
    },
    getClinic: (id) => id ? availableClinics.find(c => c.id === id) : undefined,
  }), [selectedScopes, availableClinics]);

  return <ClinicFilterContext.Provider value={value}>{children}</ClinicFilterContext.Provider>;
};

export const useClinicFilter = () => {
  const ctx = useContext(ClinicFilterContext);
  if (!ctx) throw new Error("useClinicFilter must be used within ClinicFilterProvider");
  return ctx;
};
