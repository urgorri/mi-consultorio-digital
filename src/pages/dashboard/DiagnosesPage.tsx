import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";

const allDiagnoses = [
  { code: "A09", name: "Diarrea y gastroenteritis de presunto origen infeccioso" },
  { code: "E11", name: "Diabetes mellitus tipo 2" },
  { code: "I10", name: "Hipertensión esencial (primaria)" },
  { code: "J06.9", name: "Infección aguda de las vías respiratorias superiores, no especificada" },
  { code: "J20.9", name: "Bronquitis aguda, no especificada" },
  { code: "K29.7", name: "Gastritis, no especificada" },
  { code: "K30", name: "Dispepsia funcional" },
  { code: "M54.5", name: "Dolor en la parte baja de la espalda" },
  { code: "N39.0", name: "Infección de vías urinarias, sitio no especificado" },
  { code: "R50.9", name: "Fiebre, no especificada" },
  { code: "R51", name: "Cefalea" },
  { code: "Z01.7", name: "Examen de laboratorio" },
  { code: "Z00.0", name: "Examen médico general" },
  { code: "L30.9", name: "Dermatitis, no especificada" },
  { code: "H10.9", name: "Conjuntivitis, no especificada" },
  { code: "B34.9", name: "Infección viral, no especificada" },
];

const DiagnosesPage = () => {
  const [search, setSearch] = useState("");

  const results = search.length > 0
    ? allDiagnoses.filter(
        (d) =>
          d.code.toLowerCase().includes(search.toLowerCase()) ||
          d.name.toLowerCase().includes(search.toLowerCase())
      )
    : allDiagnoses;

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Búsqueda de diagnósticos</h1>
          <p className="text-sm text-muted-foreground">CIE-10 · Busca por código o nombre</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar diagnóstico (ej: hipertensión, I10, gastritis)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {results.map((d) => (
              <div key={d.code} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer">
                <div className="w-14 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{d.code}</span>
                </div>
                <span className="text-sm text-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron diagnósticos</p>
            <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosesPage;
