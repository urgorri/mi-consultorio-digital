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

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  requiredForMvp: boolean;
  futureOptional: boolean;
  enabled: boolean;
  roles: AppRole[];
  capabilities: Capability[];
}

const roleCapabilities: Record<AppRole, Capability[]> = {
  profesional: ["turnos.view", "turnos.manage", "pacientes.view", "consultas.manage", "reportes.view", "configuracion.manage"],
  paciente: ["turnos.view", "portal.self"],
  admin: ["turnos.view", "admin.system"],
};

export const MODULE_CATALOG: Record<ModuleKey, ModuleDefinition> = {
  turnos: {
    key: "turnos",
    label: "Turnos",
    requiredForMvp: true,
    futureOptional: false,
    enabled: true,
    roles: ["profesional", "paciente", "admin"],
    capabilities: ["turnos.view", "turnos.manage"],
  },
  pacientes: {
    key: "pacientes",
    label: "Pacientes",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["pacientes.view"],
  },
  consultas: {
    key: "consultas",
    label: "Consultas",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["consultas.manage"],
  },
  reportes: {
    key: "reportes",
    label: "Reportes",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["reportes.view"],
  },
  configuracion: {
    key: "configuracion",
    label: "Configuración",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["profesional"],
    capabilities: ["configuracion.manage"],
  },
  portal: {
    key: "portal",
    label: "Portal Paciente",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["paciente"],
    capabilities: ["portal.self"],
  },
  admin: {
    key: "admin",
    label: "Administración",
    requiredForMvp: false,
    futureOptional: true,
    enabled: true,
    roles: ["admin"],
    capabilities: ["admin.system"],
  },
};

export const canAccessModule = (role: AppRole, moduleKey: ModuleKey) => {
  const module = MODULE_CATALOG[moduleKey];
  return module.enabled && module.roles.includes(role);
};

export const canUseCapability = (role: AppRole, capability: Capability) => roleCapabilities[role].includes(capability);
