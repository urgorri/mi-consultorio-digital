import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, MapPin, Clock, Stethoscope, Bell, MessageSquare, ListTodo, Monitor, ShieldCheck } from "lucide-react";
import NewLocationDialog from "@/components/dialogs/NewLocationDialog";
import { Badge } from "@/components/ui/badge";
import PremiumUpgradeDialog from "@/components/dialogs/PremiumUpgradeDialog";
import NewAppointmentTypeDialog from "@/components/dialogs/NewAppointmentTypeDialog";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api/client";
import { UserSession } from "@/services/api/types";
import { useEffect } from "react";

const SettingsPage = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [cie10, setCie10] = useState(true);
  const [cie11, setCie11] = useState(false);
  const [snomedCt, setSnomedCt] = useState(false);
  const [config, setConfig] = useState({
    bloodPressure: true,
    heartRate: true,
    temperature: true,
    weight: true,
    heightCm: true,
    bmi: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await authApi.listSessions();
      if (res.success) {
        setSessions(res.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await authApi.revokeSession(sessionId);
      if (res.success) {
        toast({ title: "Sesión cerrada", description: "La sesión ha sido revocada exitosamente." });
        fetchSessions();
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cerrar la sesión remota.", variant: "destructive" });
    }
  };

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
            <TabsTrigger value="consulta">Consulta</TabsTrigger>
            <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
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
                { name: "Seguimiento", duration: "20 min", visible: true, deadline: 24 },
                { name: "Primera vez", duration: "45 min", visible: true, deadline: 48 },
                { name: "Urgencia", duration: "15 min", visible: false, deadline: 0 },
              ].map((type) => (
                <div key={type.name} className="flex flex-col gap-4 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-4 pl-14">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`deadline-${type.name}`} className="text-xs text-muted-foreground">Ventana de cancelación (horas):</Label>
                      <Input
                        id={`deadline-${type.name}`}
                        type="number"
                        className="w-16 h-7 text-xs"
                        defaultValue={type.deadline}
                      />
                    </div>
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

          <TabsContent value="consulta" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Campos de la consulta</h3>
                  <p className="text-sm text-muted-foreground">Configura qué signos vitales quieres capturar por defecto</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Presión arterial</p>
                    <p className="text-sm text-muted-foreground">Habilita el campo para registrar la presión arterial</p>
                  </div>
                  <Switch checked={config.bloodPressure} onCheckedChange={(val) => setConfig({ ...config, bloodPressure: val })} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Frecuencia cardíaca</p>
                    <p className="text-sm text-muted-foreground">Habilita el campo para registrar el pulso</p>
                  </div>
                  <Switch checked={config.heartRate} onCheckedChange={(val) => setConfig({ ...config, heartRate: val })} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Temperatura</p>
                    <p className="text-sm text-muted-foreground">Habilita el campo para registrar la temperatura corporal</p>
                  </div>
                  <Switch checked={config.temperature} onCheckedChange={(val) => setConfig({ ...config, temperature: val })} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Peso</p>
                    <p className="text-sm text-muted-foreground">Habilita el campo para registrar el peso del paciente</p>
                  </div>
                  <Switch checked={config.weight} onCheckedChange={(val) => setConfig({ ...config, weight: val })} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">Talla</p>
                    <p className="text-sm text-muted-foreground">Habilita el campo para registrar la estatura (cm)</p>
                  </div>
                  <Switch checked={config.heightCm} onCheckedChange={(val) => setConfig({ ...config, heightCm: val })} />
                </div>
                <div className="flex items-center justify-between border border-border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">IMC (Índice de Masa Corporal)</p>
                    <p className="text-sm text-muted-foreground">Cálculo automático basado en peso y talla</p>
                  </div>
                  <Switch checked={config.bmi} onCheckedChange={(val) => setConfig({ ...config, bmi: val })} />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Configuración jerárquica:</strong> Estos ajustes tienen prioridad sobre los valores por defecto
                  de tu especialidad (Medicina General).
                </p>
              </div>

              <Button className="gap-1" onClick={() => toast({ title: "Configuración guardada", description: "Tus preferencias de consulta han sido actualizadas." })}>
                <Save className="w-4 h-4" /> Guardar configuración
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sesiones" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sesiones activas</h3>
                  <p className="text-sm text-muted-foreground">Gestiona los dispositivos que tienen acceso a tu cuenta</p>
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingSessions ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{session.browser} en {session.os}</p>
                            {session.isCurrent && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-none text-[10px] px-1.5 py-0">Esta sesión</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{session.device} • {session.ipAddress}</p>
                          <p className="text-xs text-muted-foreground">Última actividad: {session.lastActive}</p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRevokeSession(session.id)}>
                          Cerrar sesión
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No se encontraron otras sesiones activas.</p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Si ves un dispositivo que no reconoces, te recomendamos cerrar la sesión y cambiar tu contraseña inmediatamente.
                </p>
              </div>
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
