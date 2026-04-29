import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Search, X, User, Heart, AlertTriangle, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { diagnosesApi, patientsApi, consultationsApi } from "@/services/api";
import type { Diagnosis, CodingSystem, Patient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

const systemColors: Record<CodingSystem, string> = {
  "CIE-10": "bg-primary/10 text-primary",
  "CIE-11": "bg-secondary/20 text-secondary-foreground",
  "SNOMED-CT": "bg-accent text-accent-foreground",
};

const NewConsultationPage = () => {
  const { patientId } = useParams();
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [diagnosisResults, setDiagnosisResults] = useState<Diagnosis[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([]);
  const [activeSystem, setActiveSystem] = useState<string>("CIE-10");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const id = patientId || "p-1";
    patientsApi.getById(id).then(res => setPatient(res.data));
  }, [patientId]);

  useEffect(() => {
    if (diagnosisSearch.length > 1) {
      diagnosesApi.search(diagnosisSearch, [activeSystem]).then(res => setDiagnosisResults(res.data));
    } else {
      setDiagnosisResults([]);
    }
  }, [diagnosisSearch, activeSystem]);

  const addDiagnosis = (d: Diagnosis) => {
    if (!selectedDiagnoses.find(s => s.code === d.code && s.codingSystem === d.codingSystem)) {
      setSelectedDiagnoses([...selectedDiagnoses, d]);
    }
    setDiagnosisSearch("");
    setDiagnosisResults([]);
  };

  const removeDiagnosis = (code: string, system: CodingSystem) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => !(d.code === code && d.codingSystem === system)));
  };

  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      await consultationsApi.create({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        professionalId: "prof-1",
        professionalName: "Dra. María García",
        clinicId: patient.clinicIds[0] || null, // Simplified for mock
        date: new Date().toISOString(),
        diagnoses: selectedDiagnoses,
        // ... other fields would be gathered from form
      });
      toast({ title: "Consulta guardada", description: "La consulta se ha registrado exitosamente." });
      navigate(`/dashboard/pacientes/${patient.id}`);
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

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
            <h1 className="text-2xl font-bold text-foreground">Nueva consulta</h1>
            <p className="text-sm text-muted-foreground">Paciente: {patient ? `${patient.firstName} ${patient.lastName}` : "Cargando..."}</p>
          </div>
          <Button className="gap-1" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {/* Patient info card */}
        {patient && (
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-muted-foreground">{patient.gender} · {calculateAge(patient.birthDate)} años</p>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Tipo de sangre</p>
                    <p className="text-xs text-muted-foreground">{patient.bloodType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Alergias</p>
                    <p className="text-xs text-muted-foreground">{patient.allergies || "Ninguna"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Última visita</p>
                    <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
                  </div>
                </div>
              </div>
            </div>
            {patient.conditions && patient.conditions !== "Ninguna" && (
              <div className="mt-3 flex items-start gap-2 pl-16">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Condiciones</p>
                  <p className="text-xs text-muted-foreground">{patient.conditions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Motivo de consulta</h3>
              <Textarea placeholder="Describe el motivo principal de la consulta..." rows={3} />
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Anamnesis</h3>
              <Textarea placeholder="Historia clínica relevante, síntomas, evolución..." rows={4} />
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Exploración física</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Presión arterial</Label>
                  <Input placeholder="120/80 mmHg" />
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia cardíaca</Label>
                  <Input placeholder="72 bpm" />
                </div>
                <div className="space-y-2">
                  <Label>Temperatura</Label>
                  <Input placeholder="36.5 °C" />
                </div>
                <div className="space-y-2">
                  <Label>Peso</Label>
                  <Input placeholder="68 kg" />
                </div>
              </div>
              <Textarea placeholder="Hallazgos de la exploración física..." rows={3} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Diagnóstico</h3>
              <Tabs value={activeSystem} onValueChange={setActiveSystem}>
                <TabsList className="bg-muted w-full">
                  <TabsTrigger value="CIE-10" className="flex-1">CIE-10</TabsTrigger>
                  <TabsTrigger value="CIE-11" className="flex-1">CIE-11</TabsTrigger>
                  <TabsTrigger value="SNOMED-CT" className="flex-1">SNOMED CT</TabsTrigger>
                </TabsList>
              </Tabs>
              {selectedDiagnoses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDiagnoses.map(d => (
                    <span key={`${d.codingSystem}-${d.code}`} className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${systemColors[d.codingSystem]}`}>
                        {d.codingSystem}
                      </Badge>
                      <span className="font-medium">{d.code}</span> {d.name}
                      <button onClick={() => removeDiagnosis(d.code, d.codingSystem)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${activeSystem}...`}
                  value={diagnosisSearch}
                  onChange={(e) => setDiagnosisSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {diagnosisResults.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-auto">
                  {diagnosisResults.map((d) => (
                    <button
                      key={`${d.codingSystem}-${d.code}`}
                      className="w-full text-left px-4 py-3 hover:bg-accent/30 transition-colors"
                      onClick={() => addDiagnosis(d)}
                    >
                      <span className="text-sm font-medium text-primary">{d.code}</span>
                      <span className="text-sm text-foreground ml-2">{d.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Plan de tratamiento</h3>
              <Textarea placeholder="Medicamentos, instrucciones, recomendaciones..." rows={4} />
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Seguimiento</h3>
              <Textarea placeholder="Próximos pasos, fecha de control, indicaciones especiales..." rows={3} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewConsultationPage;
