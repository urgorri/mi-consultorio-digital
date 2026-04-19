import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Phone, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { patientsApi } from "@/services/api";
import type { Patient } from "@/services/api";
import NewPatientDialog from "@/components/dialogs/NewPatientDialog";
import { PatientScopeBadges } from "@/components/dashboard/ClinicBadge";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";

const PatientsPage = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const { matchesFilter } = useClinicFilter();

  useEffect(() => {
    patientsApi.list({ search: search || undefined }).then(res => {
      setPatients(res.data);
      setLoading(false);
    });
  }, [search]);

  const visiblePatients = useMemo(
    () => patients.filter(p => matchesFilter({ clinicIds: p.clinicIds, isPrivate: p.isPrivate })),
    [patients, matchesFilter]
  );

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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_80px_40px] gap-4 px-5 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Teléfono</span>
            <span>Última visita</span>
            <span>Visitas</span>
            <span></span>
          </div>
          <div className="divide-y divide-border">
            {visiblePatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/dashboard/pacientes/${patient.id}`}
                className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_100px_80px_40px] gap-2 md:gap-4 px-5 py-4 hover:bg-accent/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{patient.firstName} {patient.lastName}</p>
                    <div className="mt-1">
                      <PatientScopeBadges clinicIds={patient.clinicIds} isPrivate={patient.isPrivate} />
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 md:hidden" /> {patient.email}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3 md:hidden" /> {patient.phone}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(patient.lastVisit).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
                <span className="text-sm text-muted-foreground">{patient.totalVisits}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Link>
            ))}
          </div>
        </div>

        {visiblePatients.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron pacientes</p>
            <p className="text-sm text-muted-foreground">Probá ajustar el filtro de ámbito o el término de búsqueda</p>
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
