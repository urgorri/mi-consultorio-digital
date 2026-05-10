import type { User } from "@/services/api/types";

/**
 * Returns the appropriate login route based on the user's role after logout.
 */
export const getLogoutRedirectPath = (role?: User["role"]): string => {
  if (role === "paciente") return "/login/paciente";
  if (role === "profesional") return "/login/profesional";
  return "/login";
};
