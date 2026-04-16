import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { diagnosesApi } from "@/services/api";
import type { Diagnosis, CodingSystem } from "@/services/api";

const systemLabels: Record<CodingSystem, string> = {
  "CIE-10": "CIE-10",
  "CIE-11": "CIE-11",
  "SNOMED-CT": "SNOMED CT",
};

const systemColors: Record<CodingSystem, string> = {
  "CIE-10": "bg-primary/10 text-primary",
  "CIE-11": "bg-secondary/20 text-secondary-foreground",
  "SNOMED-CT": "bg-accent text-accent-foreground",
};

const DiagnosesPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSystem, setActiveSystem] = useState<string>("all");

  useEffect(() => {
    const systems = activeSystem === "all" ? undefined : [activeSystem];
    diagnosesApi.search(search, systems).then(res => {
      setResults(res.data);
      setLoading(false);
    });
  }, [search, activeSystem]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Búsqueda de diagnósticos</h1>
            <p className="text-sm text-muted-foreground">CIE-10 · CIE-11 · SNOMED CT</p>
          </div>
          <Tabs value={activeSystem} onValueChange={setActiveSystem}>
            <TabsList className="bg-muted">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="CIE-10">CIE-10</TabsTrigger>
              <TabsTrigger value="CIE-11">CIE-11</TabsTrigger>
              <TabsTrigger value="SNOMED-CT">SNOMED CT</TabsTrigger>
            </TabsList>
          </Tabs>
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
              <div key={`${d.codingSystem}-${d.code}`} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer">
                <div className="w-20 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{d.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{d.name}</span>
                  {d.category && <span className="text-xs text-muted-foreground ml-2">· {d.category}</span>}
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 ${systemColors[d.codingSystem]}`}>
                  {systemLabels[d.codingSystem]}
                </Badge>
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
