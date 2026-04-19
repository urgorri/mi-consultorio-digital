import { Building2, User as UserIcon } from "lucide-react";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";

interface ClinicBadgeProps {
  clinicId?: string | null;
  isPrivate?: boolean;
  size?: "sm" | "md";
}

const ClinicBadge = ({ clinicId, isPrivate, size = "sm" }: ClinicBadgeProps) => {
  const { getClinic } = useClinicFilter();
  const clinic = getClinic(clinicId);
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";

  if (clinic) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-medium ${padding}`}
        style={{
          backgroundColor: `hsl(${clinic.color} / 0.12)`,
          color: `hsl(${clinic.color})`,
        }}
      >
        <Building2 className="w-3 h-3" />
        {clinic.shortName}
      </span>
    );
  }

  if (isPrivate) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md font-medium bg-muted text-muted-foreground ${padding}`}>
        <UserIcon className="w-3 h-3" />
        Privado
      </span>
    );
  }
  return null;
};

interface PatientScopeBadgesProps {
  clinicIds: string[];
  isPrivate: boolean;
  size?: "sm" | "md";
}

export const PatientScopeBadges = ({ clinicIds, isPrivate, size = "sm" }: PatientScopeBadgesProps) => (
  <div className="inline-flex flex-wrap gap-1">
    {isPrivate && <ClinicBadge isPrivate size={size} />}
    {clinicIds.map(id => <ClinicBadge key={id} clinicId={id} size={size} />)}
  </div>
);

export default ClinicBadge;
