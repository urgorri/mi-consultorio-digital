import { type ReactNode, useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface FilterDialogProps<T> {
  /** Currently applied filters (parent state). */
  value: T;
  /** Called when user clicks "Aplicar filtros". */
  onApply: (next: T) => void;
  /** Default empty state used by "Limpiar filtros". */
  defaultValue: T;
  /** Number of active filters — drives the trigger badge. */
  activeCount: number;
  /** Render the form fields. Receives draft state + setter. */
  children: (draft: T, setDraft: (next: T) => void) => ReactNode;
  title?: string;
  description?: string;
  triggerLabel?: string;
}

/**
 * Shared filter dialog used across list pages (consultas, pacientes, etc.).
 * Holds a local draft so changes only commit on "Aplicar filtros".
 */
export function FilterDialog<T>({
  value, onApply, defaultValue, activeCount, children,
  title = "Filtros", description = "Refiná los resultados de la lista.",
  triggerLabel = "Filtros",
}: FilterDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(value);

  // Sync draft whenever the dialog opens or external value changes.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(defaultValue);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 h-9"
      >
        <Filter className="w-4 h-4" />
        <span>{triggerLabel}</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground hover:bg-primary">
            {activeCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {children(draft, setDraft)}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            <Button variant="ghost" onClick={handleClear}>Limpiar filtros</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleApply}>Aplicar filtros</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FilterDialog;
