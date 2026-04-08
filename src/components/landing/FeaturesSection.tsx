import {
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Agenda inteligente",
    description:
      "Gestiona tu calendario con vistas diaria, semanal y mensual. Configura horarios, bloquea fechas y evita conflictos automáticamente.",
  },
  {
    icon: Users,
    title: "Gestión de pacientes",
    description:
      "Directorio completo con historial de citas, consultas, diagnósticos, notas clínicas y documentos adjuntos.",
  },
  {
    icon: ClipboardList,
    title: "Consultas clínicas",
    description:
      "Registra motivo de consulta, anamnesis, exploración, diagnósticos, plan de tratamiento y seguimiento en un flujo estructurado.",
  },
  {
    icon: Globe,
    title: "Portal de citas",
    description:
      "Tus pacientes agendan citas en línea viendo disponibilidad real. Funciona en cualquier dispositivo sin necesidad de llamar.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Recordatorios automáticos de citas, confirmaciones, cancelaciones y alertas importantes para ti y tus pacientes.",
  },
  {
    icon: BarChart3,
    title: "Reportes y métricas",
    description:
      "Visualiza ocupación, tasa de cancelación, tipos de consulta más frecuentes y actividad general de tu práctica.",
  },
  {
    icon: Shield,
    title: "Seguridad clínica",
    description:
      "Datos protegidos con autenticación segura, control de acceso por rol y registros de auditoría de toda la actividad.",
  },
  {
    icon: Smartphone,
    title: "API abierta",
    description:
      "REST API documentada con soporte JWT y API keys para integrar con apps móviles, sistemas de terceros y más.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="caracteristicas" className="section-padding bg-card">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para tu consultorio
          </h2>
          <p className="text-muted-foreground text-lg">
            Herramientas diseñadas para profesionales de la salud que buscan
            eficiencia, organización y una mejor experiencia para sus pacientes.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-border bg-background card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
