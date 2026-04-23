import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar as CalendarIcon, ClipboardList, Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { consultationsApi, patientsApi } from "@/services/api";
import type { Consultation, Patient } from "@/services/api";
import ClinicBadge from "@/components/dashboard/ClinicBadge";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";
import { useToast } from "@/hooks/use-toast";

type SortKey = "date" | "patient";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

const ConsultationsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { matchesFilter } = useClinicFilter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [patientId, setPatientId] = useState<string>("all");
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

  const filtered = useMemo(() => {
    let list = consultations.filter(c =>
      matchesFilter({ clinicId: c.clinicId, isPrivate: c.clinicId === null })
    );
    if (from) list = list.filter(c => new Date(c.date) >= from);
    if (to) list = list.filter(c => new Date(c.date) <= to);
    if (patientId !== "all") list = list.filter(c => c.patientId === patientId);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else cmp = a.patientName.localeCompare(b.patientName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [consultations, from, to, patientId, sortKey, sortDir, matchesFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [from, to, patientId]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "date" ? "desc" : "asc"); }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  const clearFilters = () => {
    setFrom(undefined); setTo(undefined); setPatientId("all");
  };

  const handleDelete = (id: string) => {
    setConsultations(prev => prev.filter(c => c.id !== id));
    toast({ title: "Consulta eliminada", description: "La consulta se eliminó correctamente." });
  };

  const hasFilters = from || to || patientId !== "all";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
            <p className="text-sm text-muted-foreground">Listado de consultas registradas</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[160px] justify-start font-normal", !from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "dd MMM yyyy", { locale: es }) : "Cualquiera"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[160px] justify-start font-normal", !to && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "dd MMM yyyy", { locale: es }) : "Cualquiera"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={to} onSelect={setTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[220px]">
            <label className="text-xs font-medium text-muted-foreground">Paciente</label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Todos los pacientes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pacientes</SelectItem>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" /> Limpiar
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={() => navigate("/dashboard/consultas/nueva")} className="gap-1">
              <Plus className="w-4 h-4" /> Nueva consulta
            </Button>
          </div>
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
                      <button onClick={() => toggleSort("date")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                        Fecha {sortIcon("date")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("patient")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
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
