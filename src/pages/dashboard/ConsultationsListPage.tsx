import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar as CalendarIcon, ClipboardList, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { consultationsApi, patientsApi } from "@/services/api";
import type { Consultation, Patient } from "@/services/api";
import ClinicBadge from "@/components/dashboard/ClinicBadge";
import { useClinicFilter, PRIVATE_SCOPE } from "@/contexts/ClinicFilterContext";
import { useToast } from "@/hooks/use-toast";
import FilterDialog from "@/components/dashboard/FilterDialog";

type SortKey = "date" | "patient";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

interface ConsultaFilters {
  from: Date | undefined;
  to: Date | undefined;
  patientId: string;       // "all" or id
  scope: string;           // "all" | PRIVATE_SCOPE | clinicId
  professionalId: string;  // "all" or id
}

const DEFAULT_FILTERS: ConsultaFilters = {
  from: undefined, to: undefined, patientId: "all", scope: "all", professionalId: "all",
};

const ConsultationsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { matchesFilter, availableClinics } = useClinicFilter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ConsultaFilters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([consultationsApi.list(), patientsApi.list({ limit: 200 })])
      .then(([c, p]) => {
        setConsultations(c.data);
        setPatients(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive available professionals from consultations data.
  const professionals = useMemo(() => {
    const map = new Map<string, string>();
    consultations.forEach(c => map.set(c.professionalId, c.professionalName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [consultations]);

  const filtered = useMemo(() => {
    let list = consultations.filter(c =>
      matchesFilter({ clinicId: c.clinicId, isPrivate: c.clinicId === null })
    );
    if (filters.from) list = list.filter(c => new Date(c.date) >= filters.from!);
    if (filters.to) list = list.filter(c => new Date(c.date) <= filters.to!);
    if (filters.patientId !== "all") list = list.filter(c => c.patientId === filters.patientId);
    if (filters.scope !== "all") {
      list = list.filter(c =>
        filters.scope === PRIVATE_SCOPE ? c.clinicId === null : c.clinicId === filters.scope
      );
    }
    if (filters.professionalId !== "all") {
      list = list.filter(c => c.professionalId === filters.professionalId);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else cmp = a.patientName.localeCompare(b.patientName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [consultations, filters, sortKey, sortDir, matchesFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filters]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "date" ? "desc" : "asc"); }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />;
  };

  const sortHeaderClass = (key: SortKey) =>
    cn("inline-flex items-center gap-1 hover:text-foreground transition-colors", sortKey === key && "text-foreground font-semibold");

  const handleDelete = (id: string) => {
    setConsultations(prev => prev.filter(c => c.id !== id));
    toast({ title: "Consulta eliminada", description: "La consulta se eliminó correctamente." });
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.from) n++;
    if (filters.to) n++;
    if (filters.patientId !== "all") n++;
    if (filters.scope !== "all") n++;
    if (filters.professionalId !== "all") n++;
    return n;
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
            <p className="text-sm text-muted-foreground">Listado de consultas registradas</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <FilterDialog<ConsultaFilters>
            value={filters}
            defaultValue={DEFAULT_FILTERS}
            onApply={setFilters}
            activeCount={activeCount}
            title="Filtros de consultas"
            description="Filtrá las consultas por fecha, paciente, ámbito o profesional."
          >
            {(draft, setDraft) => (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Desde</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start font-normal", !draft.from && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {draft.from ? format(draft.from, "dd MMM yyyy", { locale: es }) : "Cualquiera"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={draft.from} onSelect={(d) => setDraft({ ...draft, from: d })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Hasta</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start font-normal", !draft.to && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {draft.to ? format(draft.to, "dd MMM yyyy", { locale: es }) : "Cualquiera"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={draft.to} onSelect={(d) => setDraft({ ...draft, to: d })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Paciente</label>
                  <Select value={draft.patientId} onValueChange={(v) => setDraft({ ...draft, patientId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los pacientes</SelectItem>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                {professionals.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Profesional</label>
                    <Select value={draft.professionalId} onValueChange={(v) => setDraft({ ...draft, professionalId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los profesionales</SelectItem>
                        {professionals.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </FilterDialog>

          <Button onClick={() => navigate("/dashboard/consultas/nueva")} className="gap-1">
            <Plus className="w-4 h-4" /> Nueva consulta
          </Button>
        </div>

        {/* Table or empty state */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border py-16 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Sin consultas registradas</h3>
            <p className="text-sm text-muted-foreground mb-4">Creá la primera consulta para que aparezca aquí</p>
            <Button onClick={() => navigate("/dashboard/consultas/nueva")} className="gap-1">
              <Plus className="w-4 h-4" /> Nueva consulta
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button onClick={() => toggleSort("date")} className={sortHeaderClass("date")}>
                        Fecha {sortIcon("date")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("patient")} className={sortHeaderClass("patient")}>
                        Paciente {sortIcon("patient")}
                      </button>
                    </TableHead>
                    <TableHead className="max-w-[260px]">Motivo</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Ámbito</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map(c => {
                    const primary = c.diagnoses[0];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(c.date), "dd MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Link to={`/dashboard/pacientes/${c.patientId}`} className="text-sm font-medium text-primary hover:underline">
                            {c.patientName}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-foreground truncate">{c.reason}</p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p>{c.reason}</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {primary ? (
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{primary.code}</span>
                              <span className="text-foreground truncate max-w-[180px] inline-block align-middle">{primary.name}</span>
                            </span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{c.professionalName}</TableCell>
                        <TableCell>
                          <ClinicBadge clinicId={c.clinicId} isPrivate={c.clinicId === null} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/dashboard/consultas/${c.id}`)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/dashboard/consultas/${c.id}`)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                  <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
                </div>
              </div>
            )}
          </TooltipProvider>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConsultationsListPage;
