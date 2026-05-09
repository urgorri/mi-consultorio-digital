import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useParams, Link } from "react-router-dom";
import { consultationsApi } from "@/services/api";
import type { Consultation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, ChevronLeft } from "lucide-react";
import ClinicBadge from "@/components/dashboard/ClinicBadge";

const ConsultationDetailPage = () => {
  const { id } = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      consultationsApi.getById(id).then(res => {
        setConsultation(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Consulta no encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <Link to="/dashboard/consultas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Volver al listado
        </Link>
        <div className="flex items-start gap-3">
          <Link to={`/dashboard/pacientes/${consultation.patientId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">Consulta</h1>
              <ClinicBadge clinicId={consultation.clinicId} isPrivate={consultation.clinicId === null} size="md" />
            </div>
            <p className="text-sm text-muted-foreground">
              <Link to={`/dashboard/pacientes/${consultation.patientId}`} className="text-primary hover:underline">{consultation.patientName}</Link>
              {" · "}{new Date(consultation.date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{consultation.professionalName}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Edit className="w-4 h-4" /> Editar
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="font-semibold text-foreground">Motivo de consulta</h3>
          <p className="text-sm text-muted-foreground">{consultation.reason}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="font-semibold text-foreground">Anamnesis</h3>
          <p className="text-sm text-muted-foreground">{consultation.anamnesis}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Exploración física</h3>
          {consultation.vitalSigns && (
            <div className="grid sm:grid-cols-4 gap-3">
              {consultation.vitalSigns.bloodPressure && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Presión arterial</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.bloodPressure}</p>
                </div>
              )}
              {consultation.vitalSigns.heartRate && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Frec. cardíaca</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.heartRate}</p>
                </div>
              )}
              {consultation.vitalSigns.temperature && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.temperature}</p>
                </div>
              )}
              {consultation.vitalSigns.weight && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.weight}</p>
                </div>
              )}
              {consultation.vitalSigns.heightCm && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Talla</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.heightCm} cm</p>
                </div>
              )}
              {consultation.vitalSigns.bmi && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">IMC</p>
                  <p className="text-sm font-medium text-foreground">{consultation.vitalSigns.bmi.toFixed(1)}</p>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">{consultation.physicalExam}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Diagnóstico</h3>
          {consultation.diagnoses.map(d => (
            <div key={d.code} className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{d.code}</span>
              <span className="text-sm text-foreground">{d.name}</span>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="font-semibold text-foreground">Plan de tratamiento</h3>
          <p className="text-sm text-muted-foreground">{consultation.treatment}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="font-semibold text-foreground">Seguimiento</h3>
          <p className="text-sm text-muted-foreground">{consultation.followUp}</p>
        </div>

        {consultation.notes && (
          <div className="bg-card rounded-xl border border-border p-5 space-y-2">
            <h3 className="font-semibold text-foreground">Notas adicionales</h3>
            <p className="text-sm text-muted-foreground">{consultation.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConsultationDetailPage;
