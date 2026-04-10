import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { diagnosesApi } from "@/services/api";
import type { Diagnosis } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const NewConsultationPage = () => {
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [diagnosisResults, setDiagnosisResults] = useState<Diagnosis[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (diagnosisSearch.length > 1) {
      diagnosesApi.search(diagnosisSearch).then(res => setDiagnosisResults(res.data));
    } else {
      setDiagnosisResults([]);
    }
  }, [diagnosisSearch]);

  const addDiagnosis = (d: Diagnosis) => {
    if (!selectedDiagnoses.find(s => s.code === d.code)) {
      setSelectedDiagnoses([...selectedDiagnoses, d]);
    }
    setDiagnosisSearch("");
    setDiagnosisResults([]);
  };

  const removeDiagnosis = (code: string) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => d.code !== code));
  };

  const handleSave = () => {
    toast({ title: "Consulta guardada", description: "La consulta se ha registrado exitosamente." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/pacientes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Nueva consulta</h1>
            <p className="text-sm text-muted-foreground">Paciente: Laura Martínez</p>
          </div>
          <Button className="gap-1" onClick={handleSave}>
            <Save className="w-4 h-4" /> Guardar
          </Button>
        </div>

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

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Diagnóstico</h3>
            {selectedDiagnoses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDiagnoses.map(d => (
                  <span key={d.code} className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    <span className="font-medium">{d.code}</span> {d.name}
                    <button onClick={() => removeDiagnosis(d.code)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar diagnóstico por código o nombre (CIE-10)..."
                value={diagnosisSearch}
                onChange={(e) => setDiagnosisSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {diagnosisResults.length > 0 && (
              <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-auto">
                {diagnosisResults.map((d) => (
                  <button
                    key={d.code}
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
    </DashboardLayout>
  );
};

export default NewConsultationPage;
