import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface NewAppointmentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewAppointmentTypeDialog = ({ open, onOpenChange }: NewAppointmentTypeDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", duration: "30", visible: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Tipo de cita creado", description: `${form.name} (${form.duration} min) se ha agregado.` });
    onOpenChange(false);
    setForm({ name: "", duration: "30", visible: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo tipo de cita</DialogTitle>
          <DialogDescription>Define un nuevo tipo de consulta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Revisión post-operatoria" />
          </div>
          <div className="space-y-2">
            <Label>Duración (minutos) *</Label>
            <Input required type="number" min="5" max="120" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Visible en portal público</Label>
            <Switch checked={form.visible} onCheckedChange={v => setForm(p => ({ ...p, visible: v }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Crear tipo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentTypeDialog;
