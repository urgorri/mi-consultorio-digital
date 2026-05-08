import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, Zap } from "lucide-react";
import { settingsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PremiumUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

const PremiumUpgradeDialog = ({
  open,
  onOpenChange,
  featureName = "Recordatorios por WhatsApp",
}: PremiumUpgradeDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.requestPremiumUpgrade(featureName);
      if (res.success) {
        toast({
          title: "Solicitud enviada",
          description: res.data.message,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Potencia tu práctica con Premium</DialogTitle>
          <DialogDescription>
            Activa {featureName} y otras funciones avanzadas diseñadas para ahorrarte tiempo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {[
              "Recordatorios automáticos vía WhatsApp",
              "Confirmación de citas en tiempo real",
              "Reducción de inasistencias hasta en un 40%",
              "Personalización de mensajes de recordatorio",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 bg-success/20 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <p className="text-sm text-foreground">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              Los pacientes podrán confirmar o cancelar sus citas directamente desde WhatsApp, sincronizándose con tu agenda.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Más tarde
          </Button>
          <Button onClick={handleRequest} disabled={loading}>
            {loading ? "Enviando..." : "Solicitar versión Premium"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeDialog;
