import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { diagnosesApi } from "@/services/api";
import type { Diagnosis } from "@/services/api";

const DiagnosesPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diagnosesApi.search(search).then(res => {
      setResults(res.data);
      setLoading(false);
    });
  }, [search]);

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
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{d.name}</span>
                  {d.category && <span className="text-xs text-muted-foreground ml-2">· {d.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {results.length === 0 && !loading && (
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
