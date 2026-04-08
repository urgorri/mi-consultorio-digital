import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, ClipboardList, FileText, Plus, Edit,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const patientData = {
  name: "Laura Martínez",
  age: 34,
  gender: "Femenino",
  birthDate: "15/06/1991",
  email: "laura@email.com",
  phone: "+52 55 1111 2222",
  address: "Col. Roma, Ciudad de México",
  bloodType: "O+",
  allergies: "Penicilina",
  conditions: "Hipertensión arterial controlada",
};

const appointments = [
  { date: "5 abr 2026", time: "10:30", type: "General", status: "completada", doctor: "Dra. García" },
  { date: "20 mar 2026", time: "11:00", type: "Seguimiento", status: "completada", doctor: "Dra. García" },
  { date: "5 mar 2026", time: "09:30", type: "General", status: "completada", doctor: "Dra. García" },
];

const consultations = [
  {
    date: "5 abr 2026",
    reason: "Control de presión arterial",
    diagnosis: "I10 - Hipertensión esencial",
    notes: "Paciente estable. Se mantiene medicación actual.",
  },
  {
    date: "20 mar 2026",
    reason: "Revisión de laboratorios",
    diagnosis: "Z01.7 - Examen de laboratorio",
    notes: "Resultados dentro de parámetros normales. Se agenda seguimiento en 2 semanas.",
  },
];

const statusColors: Record<string, string> = {
  completada: "bg-success/10 text-success",
  confirmada: "bg-primary/10 text-primary",
  cancelada: "bg-destructive/10 text-destructive",
};

const PatientDetailPage = () => {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/pacientes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{patientData.name}</h1>
            <p className="text-sm text-muted-foreground">{patientData.age} años · {patientData.gender} · Paciente #{id}</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1">
            <Edit className="w-4 h-4" /> Editar
          </Button>
          <Link to="/dashboard/consultas/nueva">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Nueva consulta
            </Button>
          </Link>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="text-sm font-medium text-foreground truncate">{patientData.email}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm font-medium text-foreground">{patientData.phone}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nacimiento</p>
              <p className="text-sm font-medium text-foreground">{patientData.birthDate}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="text-sm font-medium text-foreground truncate">{patientData.address}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="consultas">
          <TabsList className="bg-muted">
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="citas">Historial de citas</TabsTrigger>
            <TabsTrigger value="antecedentes">Antecedentes</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas" className="space-y-3 mt-4">
            {consultations.map((c, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 cursor-pointer card-hover">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">{c.date}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{c.diagnosis}</span>
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{c.reason}</p>
                <p className="text-sm text-muted-foreground">{c.notes}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="citas" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {appointments.map((apt, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{apt.date}</p>
                      <p className="text-xs text-muted-foreground">{apt.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{apt.type}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="antecedentes" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo de sangre</p>
                <p className="text-sm font-medium text-foreground">{patientData.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Alergias</p>
                <p className="text-sm font-medium text-foreground">{patientData.allergies}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Condiciones</p>
                <p className="text-sm font-medium text-foreground">{patientData.conditions}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetailPage;
