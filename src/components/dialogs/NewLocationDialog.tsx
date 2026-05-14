import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NewLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewLocationDialog = ({ open, onOpenChange }: NewLocationDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Ubicación agregada", description: `${form.name} se ha registrado.` });
    onOpenChange(false);
    setForm({ name: "", address: "", phone: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva ubicación</DialogTitle>
          <DialogDescription>Agrega un nuevo consultorio o ubicación.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del consultorio *</Label>
            <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Consultorio Sur" />
          </div>
          <div className="space-y-2">
            <Label>Dirección *</Label>
            <Input required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Av. Insurgentes 789, Col. Roma" />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Agregar ubicación</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLocationDialog;
