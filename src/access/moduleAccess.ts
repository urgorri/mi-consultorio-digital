import type { User } from "@/services/api/types";

export type AppRole = User["role"];

export type Capability =
  | "turnos.view"
  | "turnos.manage"
  | "pacientes.view"
  | "consultas.manage"
  | "reportes.view"
  | "configuracion.manage"
  | "portal.self"
  | "admin.system";

export type ModuleKey = "turnos" | "pacientes" | "consultas" | "reportes" | "configuracion" | "portal" | "admin";

export type PlanType = "basic" | "professional" | "premium" | "enterprise";

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  isCore: boolean;
  enabled: boolean;
  roles: AppRole[];
  capabilities: Capability[];
}

export const PLAN_MODULES: Record<PlanType, ModuleKey[]> = {
  basic: ["turnos", "configuracion"],
  professional: ["turnos", "configuracion", "pacientes", "consultas"],
  premium: ["turnos", "configuracion", "pacientes", "consultas", "reportes"],
  enterprise: ["turnos", "configuracion", "pacientes", "consultas", "reportes", "admin"],
};

export const MODULE_CATALOG: Record<ModuleKey, ModuleDefinition> = {
  turnos: {
    key: "turnos",
    label: "Turnos",
    isCore: true,
    enabled: true,
    roles: ["profesional", "paciente", "admin"],
    capabilities: ["turnos.view", "turnos.manage"],
  },
  pacientes: {
    key: "pacientes",
    label: "Pacientes",
    isCore: false,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["pacientes.view"],
  },
  consultas: {
    key: "consultas",
    label: "Consultas",
    isCore: false,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["consultas.manage"],
  },
  reportes: {
    key: "reportes",
    label: "Reportes",
    isCore: false,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["reportes.view"],
  },
  configuracion: {
    key: "configuracion",
    label: "Configuración",
    isCore: true,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["configuracion.manage"],
  },
  portal: {
    key: "portal",
    label: "Portal Paciente",
    isCore: true,
    enabled: true,
    roles: ["paciente"],
    capabilities: ["portal.self"],
  },
  admin: {
    key: "admin",
    label: "Administración",
    isCore: false,
    enabled: true,
    roles: ["admin"],
    capabilities: ["admin.system"],
  },
};

export const canAccessModule = (user: { role: AppRole; plan?: PlanType; activeModules?: ModuleKey[] }, moduleKey: ModuleKey) => {
  const module = MODULE_CATALOG[moduleKey];
  if (!module || !module.enabled || !module.roles.includes(user.role)) return false;

  // Core modules are always accessible to their roles
  if (module.isCore) return true;

  // Check if explicitly enabled
  if (user.activeModules?.includes(moduleKey)) return true;

  // Check if included in plan
  if (user.plan && PLAN_MODULES[user.plan].includes(moduleKey)) return true;

  return false;
};

export const canUseCapability = (user: { role: AppRole; plan?: PlanType; activeModules?: ModuleKey[] }, capability: Capability) => {
  // Find which module this capability belongs to
  const moduleKey = (Object.keys(MODULE_CATALOG) as ModuleKey[]).find(key =>
    MODULE_CATALOG[key].capabilities.includes(capability)
  );

  if (!moduleKey) return false;

  return canAccessModule(user, moduleKey);
};
