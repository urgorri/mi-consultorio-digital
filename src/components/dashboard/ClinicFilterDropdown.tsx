import { Building2, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClinicFilter, PRIVATE_SCOPE } from "@/contexts/ClinicFilterContext";

const ClinicFilterDropdown = () => {
  const { availableClinics, selectedScopes, toggleScope, clearScopes } = useClinicFilter();

  const label = (() => {
    if (selectedScopes.length === 0) return "Todo";
    if (selectedScopes.length === 1) {
      const s = selectedScopes[0];
      if (s === PRIVATE_SCOPE) return "Privado";
      return availableClinics.find(c => c.id === s)?.shortName ?? "1 ámbito";
    }
    return `${selectedScopes.length} ámbitos`;
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <Building2 className="w-4 h-4" />
          <span className="text-xs font-medium">{label}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs">Filtrar por ámbito</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); clearScopes(); }} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">Todo</span>
            {selectedScopes.length === 0 && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleScope(PRIVATE_SCOPE); }} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">Privado</span>
            {selectedScopes.includes(PRIVATE_SCOPE) && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Clínicas
        </DropdownMenuLabel>
        {availableClinics.map(c => (
          <DropdownMenuItem
            key={c.id}
            onSelect={(e) => { e.preventDefault(); toggleScope(c.id); }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `hsl(${c.color})` }}
                />
                <span className="text-sm">{c.name}</span>
              </span>
              {selectedScopes.includes(c.id) && <Check className="w-4 h-4 text-primary" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClinicFilterDropdown;
