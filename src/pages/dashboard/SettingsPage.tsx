import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, MapPin, Clock, Stethoscope } from "lucide-react";
import NewLocationDialog from "@/components/dialogs/NewLocationDialog";
import NewAppointmentTypeDialog from "@/components/dialogs/NewAppointmentTypeDialog";
import { useToast } from "@/hooks/use-toast";
import NewLocationDialog from "@/components/dialogs/NewLocationDialog";
import NewAppointmentTypeDialog from "@/components/dialogs/NewAppointmentTypeDialog";

const SettingsPage = () => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [cie10, setCie10] = useState(true);
  const [cie11, setCie11] = useState(false);
  const [snomedCt, setSnomedCt] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">Administra tu perfil y tu práctica</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList className="bg-muted">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="consultorio">Consultorio</TabsTrigger>
            <TabsTrigger value="horarios">Horarios</TabsTrigger>
            <TabsTrigger value="citas">Tipos de cita</TabsTrigger>
            <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Datos personales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombre</Label><Input defaultValue="María" /></div>
                <div className="space-y-2"><Label>Apellido</Label><Input defaultValue="García" /></div>
                <div className="space-y-2"><Label>Especialidad</Label><Input defaultValue="Medicina General" /></div>
                <div className="space-y-2"><Label>Cédula profesional</Label><Input defaultValue="12345678" /></div>
                <div className="space-y-2"><Label>Correo</Label><Input defaultValue="dra.garcia@email.com" /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input defaultValue="+52 55 9876 5432" /></div>
              </div>
              <Button className="gap-1"><Save className="w-4 h-4" /> Guardar cambios</Button>
            </div>
          </TabsContent>

          <TabsContent value="consultorio" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Ubicaciones</h3>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setLocationOpen(true)}>
                  <Plus className="w-4 h-4" /> Agregar ubicación
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Consultorio Centro", address: "Av. Reforma 123, Col. Centro, CDMX" },
                  { name: "Consultorio Norte", address: "Blvd. Ávila Camacho 456, Polanco, CDMX" },
                ].map(loc => (
                  <div key={loc.name} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{loc.name}</p>
                        <p className="text-sm text-muted-foreground">{loc.address}</p>
                      </div>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="horarios" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Horario de atención</h3>
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((day) => (
                <div key={day} className="flex items-center gap-4 py-2">
                  <div className="w-28"><span className="text-sm font-medium text-foreground">{day}</span></div>
                  <Switch defaultChecked />
                  <div className="flex items-center gap-2 text-sm">
                    <Input className="w-24 h-8" defaultValue="09:00" />
                    <span className="text-muted-foreground">a</span>
                    <Input className="w-24 h-8" defaultValue="17:00" />
                  </div>
                </div>
              ))}
              {["Sábado", "Domingo"].map((day) => (
                <div key={day} className="flex items-center gap-4 py-2">
                  <div className="w-28"><span className="text-sm font-medium text-foreground">{day}</span></div>
                  <Switch />
                  <span className="text-sm text-muted-foreground">No disponible</span>
                </div>
              ))}
              <Button className="gap-1"><Save className="w-4 h-4" /> Guardar horarios</Button>
            </div>
          </TabsContent>

          <TabsContent value="citas" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Tipos de cita</h3>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setTypeOpen(true)}>
                  <Plus className="w-4 h-4" /> Agregar tipo
                </Button>
              </div>
              {[
                { name: "Consulta General", duration: "30 min", visible: true },
                { name: "Seguimiento", duration: "20 min", visible: true },
                { name: "Primera vez", duration: "45 min", visible: true },
                { name: "Urgencia", duration: "15 min", visible: false },
              ].map((type) => (
                <div key={type.name} className="flex items-center gap-4 border border-border rounded-lg p-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.duration}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{type.visible ? "Público" : "Privado"}</span>
                    <Switch defaultChecked={type.visible} />
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewLocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
      <NewAppointmentTypeDialog open={typeOpen} onOpenChange={setTypeOpen} />
    </DashboardLayout>
  );
};

export default SettingsPage;
