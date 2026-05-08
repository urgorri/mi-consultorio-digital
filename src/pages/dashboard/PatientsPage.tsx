import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, User, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { patientsApi } from "@/services/api";
import type { Patient } from "@/services/api";
import NewPatientDialog from "@/components/dialogs/NewPatientDialog";
import { PatientScopeBadges } from "@/components/dashboard/ClinicBadge";
import { useClinicFilter, PRIVATE_SCOPE } from "@/contexts/ClinicFilterContext";
import FilterDialog from "@/components/dashboard/FilterDialog";
import { cn } from "@/lib/utils";

type SortKey = "name" | "dni" | "lastVisit" | "scope";
type SortDir = "asc" | "desc";

interface PatientFilters {
  scope: string;          // "all" | PRIVATE_SCOPE | clinicId
  gender: string;         // "all" | "Femenino" | "Masculino" | "Otro"
  ageFrom: string;        // numeric string
  ageTo: string;
  clinicalType: string;   // "all" | "first" | "followup" | "none"
  professionalId: string;   // "all" | id (placeholder until model supports owner)
}

const DEFAULT_FILTERS: PatientFilters = {
  scope: "all", gender: "all", ageFrom: "", ageTo: "",
  clinicalType: "all", professionalId: "all",
};

const calcAge = (birthDate: string) => {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};

const PatientsPage = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { matchesFilter, availableClinics, getClinic } = useClinicFilter();

  useEffect(() => {
    patientsApi.list({
      search: search || undefined,
      clinicalType: filters.clinicalType !== "all" ? filters.clinicalType : undefined,
    }).then(res => {
      setPatients(res.data);
      setLoading(false);
    });
  }, [search, filters.clinicalType]);

  const visiblePatients = useMemo(() => {
    let list = patients.filter(p => matchesFilter({ clinicIds: p.clinicIds, isPrivate: p.isPrivate }));

    // Apply dialog filters
    if (filters.scope !== "all") {
      list = list.filter(p =>
        filters.scope === PRIVATE_SCOPE ? p.isPrivate : p.clinicIds.includes(filters.scope)
      );
    }
    if (filters.gender !== "all") list = list.filter(p => p.gender === filters.gender);
    const ageFrom = filters.ageFrom ? parseInt(filters.ageFrom, 10) : null;
    const ageTo = filters.ageTo ? parseInt(filters.ageTo, 10) : null;
    if (ageFrom !== null) list = list.filter(p => calcAge(p.birthDate) >= ageFrom);
    if (ageTo !== null) list = list.filter(p => calcAge(p.birthDate) <= ageTo);
    // professionalId: not modeled yet, leaves a no-op hook for future backend.

    // Sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "dni":
          cmp = (a.documentNumber || "").localeCompare(b.documentNumber || "");
          break;
        case "lastVisit":
          cmp = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
          break;
        case "scope": {
          const aLabel = a.isPrivate ? "Privado" : (getClinic(a.clinicIds[0])?.name ?? "");
          const bLabel = b.isPrivate ? "Privado" : (getClinic(b.clinicIds[0])?.name ?? "");
          cmp = aLabel.localeCompare(bLabel);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [patients, filters, matchesFilter, sortKey, sortDir, getClinic]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      // Sensible default: name asc, others desc (newest/most recent first).
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const sortHeaderClass = (key: SortKey) =>
    cn(
      "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider hover:text-foreground transition-colors",
      sortKey === key ? "text-foreground font-semibold" : "text-muted-foreground"
    );

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.scope !== "all") n++;
    if (filters.gender !== "all") n++;
    if (filters.ageFrom) n++;
    if (filters.ageTo) n++;
    if (filters.clinicalType !== "all") n++;
    if (filters.professionalId !== "all") n++;
    return n;
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-sm text-muted-foreground">{visiblePatients.length} de {patients.length} pacientes</p>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" /> Nuevo paciente
          </Button>
        </div>

        {/* Toolbar: search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI, correo o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <FilterDialog<PatientFilters>
            value={filters}
            defaultValue={DEFAULT_FILTERS}
            onApply={setFilters}
            activeCount={activeCount}
            title="Filtros de pacientes"
            description="Refiná por ámbito, género, edad, consultas o profesional."
          >
            {(draft, setDraft) => (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Ámbito</label>
                  <Select value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los ámbitos</SelectItem>
                      <SelectItem value={PRIVATE_SCOPE}>Privado</SelectItem>
                      {availableClinics.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Género</label>
                  <Select value={draft.gender} onValueChange={(v) => setDraft({ ...draft, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Edad desde</label>
                    <Input
                      type="number" min={0} max={120} placeholder="0"
                      value={draft.ageFrom}
                      onChange={(e) => setDraft({ ...draft, ageFrom: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Edad hasta</label>
                    <Input
                      type="number" min={0} max={120} placeholder="120"
                      value={draft.ageTo}
                      onChange={(e) => setDraft({ ...draft, ageTo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo de consulta</label>
                  <Select value={draft.clinicalType} onValueChange={(v) => setDraft({ ...draft, clinicalType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="first">Primera vez</SelectItem>
                      <SelectItem value="followup">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </FilterDialog>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.4fr_1.2fr_1fr_110px_110px_90px] gap-4 px-5 py-3 bg-muted/50 border-b border-border">
            <button onClick={() => toggleSort("name")} className={sortHeaderClass("name")}>
              Nombre {sortIcon("name")}
            </button>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Correo</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teléfono</span>
            <button onClick={() => toggleSort("dni")} className={sortHeaderClass("dni")}>
              DNI {sortIcon("dni")}
            </button>
            <button onClick={() => toggleSort("lastVisit")} className={sortHeaderClass("lastVisit")}>
              Últ. visita {sortIcon("lastVisit")}
            </button>
            <button onClick={() => toggleSort("scope")} className={sortHeaderClass("scope")}>
              Ámbito {sortIcon("scope")}
            </button>
          </div>
          <div className="divide-y divide-border">
            {visiblePatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/dashboard/pacientes/${patient.id}`}
                className="flex flex-col md:grid md:grid-cols-[1.4fr_1.2fr_1fr_110px_110px_90px] gap-2 md:gap-4 px-5 py-4 hover:bg-accent/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{patient.firstName} {patient.lastName}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground truncate">{patient.email}</span>
                <span className="text-sm text-muted-foreground">{patient.phone}</span>
                <span className="text-sm text-muted-foreground">
                  {patient.documentType ? `${patient.documentType.toUpperCase()} ` : ""}{patient.documentNumber}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(patient.lastVisit).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
                <div className="flex flex-wrap gap-1">
                  <PatientScopeBadges clinicIds={patient.clinicIds} isPrivate={patient.isPrivate} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {visiblePatients.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron pacientes</p>
            <p className="text-sm text-muted-foreground">Probá ajustar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      <NewPatientDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(p) => setPatients(prev => [p, ...prev])}
      />
    </DashboardLayout>
  );
};

export default PatientsPage;
