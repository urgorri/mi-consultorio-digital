import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Phone, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const patients = [
  { id: "1", name: "Laura Martínez", email: "laura@email.com", phone: "+52 55 1111 2222", lastVisit: "5 abr 2026", visits: 12 },
  { id: "2", name: "Pedro Sánchez", email: "pedro@email.com", phone: "+52 55 3333 4444", lastVisit: "3 abr 2026", visits: 8 },
  { id: "3", name: "Ana Rodríguez", email: "ana@email.com", phone: "+52 55 5555 6666", lastVisit: "1 abr 2026", visits: 3 },
  { id: "4", name: "Miguel Torres", email: "miguel@email.com", phone: "+52 55 7777 8888", lastVisit: "28 mar 2026", visits: 15 },
  { id: "5", name: "Sofía Hernández", email: "sofia@email.com", phone: "+52 55 9999 0000", lastVisit: "25 mar 2026", visits: 6 },
  { id: "6", name: "Carlos Ruiz", email: "carlos@email.com", phone: "+52 55 1234 5678", lastVisit: "20 mar 2026", visits: 22 },
];

const PatientsPage = () => {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-sm text-muted-foreground">{patients.length} pacientes registrados</p>
          </div>
          <Button size="sm" className="gap-1">
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
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_80px_40px] gap-4 px-5 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Teléfono</span>
            <span>Última visita</span>
            <span>Visitas</span>
            <span></span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((patient) => (
              <Link
                key={patient.id}
                to={`/dashboard/pacientes/${patient.id}`}
                className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_100px_80px_40px] gap-2 md:gap-4 px-5 py-4 hover:bg-accent/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{patient.name}</span>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3 md:hidden" /> {patient.email}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3 md:hidden" /> {patient.phone}
                </span>
                <span className="text-sm text-muted-foreground">{patient.lastVisit}</span>
                <span className="text-sm text-muted-foreground">{patient.visits}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron pacientes</p>
            <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage;
