import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Loader2 } from "lucide-react";
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

const MIN_QUERY_LENGTH = 2;

const DiagnosesPage = () => {
  const [query, setQuery] = useState("");
  const [activeSystem, setActiveSystem] = useState<string>("all");
  const [results, setResults] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [resultLimit, setResultLimit] = useState(20);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    const systems = activeSystem === "all" ? undefined : [activeSystem];
    const res = await diagnosesApi.search(trimmed, systems);
    setResults(res.data);
    setTruncated(res.truncated);
    setResultLimit(res.limit);
    setSearched(true);
    setLoading(false);
  };

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

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar diagnóstico (ej: hipertensión, I10, gastritis)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" disabled={!canSearch || loading} className="h-11 px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
          </Button>
        </form>

        {!searched && (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Buscá un diagnóstico</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresá un término para buscar en CIE-10, CIE-11 o SNOMED CT.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo {MIN_QUERY_LENGTH} caracteres.
            </p>
          </div>
        )}

        {searched && results.length > 0 && (
          <>
            {truncated && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-2.5">
                <p className="text-xs text-warning-foreground">
                  Mostrando los primeros {resultLimit} resultados. Refiná la búsqueda para ver resultados más específicos.
                </p>
              </div>
            )}
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
          </>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron diagnósticos</p>
            <p className="text-sm text-muted-foreground">Intentá con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosesPage;
