import type { User } from "@/services/api/types";

/**
 * Returns the appropriate login route based on the user's role after logout.
 */
export const getLogoutRedirectPath = (role?: User["role"]): string => {
  if (role === "paciente") return "/login/paciente";
  if (role === "profesional") return "/login/profesional";
  return "/login";
};

/**
 * Checks if a user has any account restrictions.
 */
export const getUserRestrictions = (user: User | null) => {
  if (!user || user.role !== "profesional") return null;

  if (user.trialExpired) return "TRIAL_EXPIRED";
  if (user.invalidLicense) return "INVALID_LICENSE";
  if (user.subscriptionInactive) return "SUBSCRIPTION_INACTIVE";

  return null;
};
