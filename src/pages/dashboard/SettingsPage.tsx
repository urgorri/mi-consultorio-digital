import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, MapPin, Clock, Stethoscope, Bell, MessageSquare } from "lucide-react";
import NewLocationDialog from "@/components/dialogs/NewLocationDialog";
import { Badge } from "@/components/ui/badge";
import PremiumUpgradeDialog from "@/components/dialogs/PremiumUpgradeDialog";
import NewAppointmentTypeDialog from "@/components/dialogs/NewAppointmentTypeDialog";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
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
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
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

          <TabsContent value="notificaciones" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Canales de notificación</h3>
                  <p className="text-sm text-muted-foreground">Configura cómo recibes avisos y cómo se notifican tus pacientes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border border-border rounded-lg p-4 opacity-70">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Recordatorios automáticos por WhatsApp</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Envía recordatorios automáticos 24h antes de la cita</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch disabled />
                    <Button variant="outline" size="sm" onClick={() => setPremiumOpen(true)}>
                      Activar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Notificaciones por correo</p>
                    <p className="text-sm text-muted-foreground">Recibe un resumen diario de tu agenda por email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="bg-accent/30 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">¿Sabías qué?</p>
                    <p className="text-sm text-muted-foreground">
                      Los recordatorios por WhatsApp reducen el ausentismo de pacientes en un 40% en promedio.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary text-sm font-semibold" onClick={() => setPremiumOpen(true)}>
                      Conoce más sobre la versión Premium
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="gap-1" onClick={() => toast({ title: "Configuración guardada", description: "Tus preferencias de notificación han sido actualizadas." })}>
                <Save className="w-4 h-4" /> Guardar preferencias
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="diagnosticos" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sistemas de codificación diagnóstica</h3>
                  <p className="text-sm text-muted-foreground">Selecciona los sistemas que utilizarás al registrar diagnósticos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">CIE-10</p>
                    <p className="text-sm text-muted-foreground">Clasificación Internacional de Enfermedades, 10ª revisión</p>
                  </div>
                  <Switch checked={cie10} onCheckedChange={setCie10} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">CIE-11</p>
                    <p className="text-sm text-muted-foreground">Clasificación Internacional de Enfermedades, 11ª revisión</p>
                  </div>
                  <Switch checked={cie11} onCheckedChange={setCie11} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">SNOMED CT</p>
                    <p className="text-sm text-muted-foreground">Nomenclatura Sistematizada de Medicina — Términos Clínicos</p>
                  </div>
                  <Switch checked={snomedCt} onCheckedChange={setSnomedCt} />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> Los sistemas activos aplican solo al registro de nuevos diagnósticos. 
                  Siempre podrás ver todos los diagnósticos de tus pacientes sin importar el sistema con el que fueron registrados.
                </p>
              </div>

              <Button className="gap-1" onClick={() => toast({ title: "Configuración guardada", description: "Tus preferencias de codificación han sido actualizadas." })}>
                <Save className="w-4 h-4" /> Guardar preferencias
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewLocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
      <NewAppointmentTypeDialog open={typeOpen} onOpenChange={setTypeOpen} />
      <PremiumUpgradeDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
    </DashboardLayout>
  );
};

export default SettingsPage;
