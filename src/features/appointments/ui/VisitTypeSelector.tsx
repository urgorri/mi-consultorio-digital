import { Clock, ArrowRight } from "lucide-react";

interface VisitType {
  id: string;
  name: string;
  duration: string;
}

interface VisitTypeSelectorProps {
  visitTypes: VisitType[];
  selectedTypeId: string;
  onSelect: (typeId: string) => void;
}

export const VisitTypeSelector = ({ visitTypes, selectedTypeId, onSelect }: VisitTypeSelectorProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Tipo de consulta</h2>
      <p className="text-sm text-muted-foreground mb-6">Selecciona el motivo de tu visita</p>
      <div className="space-y-3">
        {visitTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
              selectedTypeId === type.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30 bg-card"
            }`}
          >
            <div>
              <p className="font-medium text-foreground">{type.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {type.duration}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};
