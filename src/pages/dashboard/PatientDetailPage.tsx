import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Plus, Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { patientsApi, appointmentsApi, consultationsApi } from "@/services/api";
import type { Patient, Appointment, Consultation } from "@/services/api";
import EditPatientDialog from "@/components/dialogs/EditPatientDialog";
import NewAppointmentDialog from "@/components/dialogs/NewAppointmentDialog";

const statusColors: Record<string, string> = {
  completada: "bg-success/10 text-success",
  confirmada: "bg-primary/10 text-primary",
  cancelada: "bg-destructive/10 text-destructive",
  pendiente: "bg-warning/10 text-warning",
};

const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [newApptOpen, setNewApptOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      patientsApi.getById(id, { reason: "Consulta de perfil de paciente", context: "Detalle de paciente" }),
      appointmentsApi.list({ patientId: id }),
      consultationsApi.list({ patientId: id, reason: "Carga de historial de consultas", context: "Detalle de paciente" }),
    ]).then(([pRes, aRes, cRes]) => {
      setPatient(pRes.data);
      setAppointments(aRes.data);
      setConsultations(cRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !patient) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl font-bold text-foreground">{patient.firstName} {patient.lastName}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} años · {patient.gender} · {patient.documentType ? `${patient.documentType.toUpperCase()} ` : ""}{patient.documentNumber} · Paciente #{id}
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4" /> Editar
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setNewApptOpen(true)}>
            <Calendar className="w-4 h-4" /> Agendar cita
          </Button>
          <Link to={`/dashboard/consultas/nueva/${patient.id}`}>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Nueva consulta
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Mail, label: "Correo", value: patient.email },
            { icon: Phone, label: "Teléfono", value: patient.phone },
            { icon: Calendar, label: "Nacimiento", value: new Date(patient.birthDate).toLocaleDateString("es-MX") },
            { icon: MapPin, label: "Dirección", value: patient.address },
          ].map(item => (
            <div key={item.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="consultas">
          <TabsList className="bg-muted">
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="citas">Historial de citas</TabsTrigger>
            <TabsTrigger value="antecedentes">Antecedentes</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas" className="space-y-3 mt-4">
            {consultations.map((c) => (
              <Link
                key={c.id}
                to={`/dashboard/consultas/${c.id}`}
                className="block bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {new Date(c.date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {c.diagnoses[0] && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {c.diagnoses[0].code} - {c.diagnoses[0].name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{c.reason}</p>
                <p className="text-sm text-muted-foreground">{c.treatment}</p>
              </Link>
            ))}
            {consultations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay consultas registradas
              </div>
            )}
          </TabsContent>

          <TabsContent value="citas" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(apt.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-muted-foreground">{apt.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{apt.type}</p>
                      <p className="text-xs text-muted-foreground">{apt.professionalName}</p>
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
                <p className="text-sm font-medium text-foreground">{patient.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Alergias</p>
                <p className="text-sm font-medium text-foreground">{patient.allergies}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Condiciones</p>
                <p className="text-sm font-medium text-foreground">{patient.conditions}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        onUpdated={(p) => setPatient(p)}
      />

      <NewAppointmentDialog
        open={newApptOpen}
        onOpenChange={setNewApptOpen}
        onCreated={(apt) => setAppointments(prev => [...prev, apt])}
      />
    </DashboardLayout>
  );
};

export default PatientDetailPage;
