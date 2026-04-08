import { UserPlus, Settings, CalendarCheck, Smile } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crea tu cuenta",
    description: "Regístrate en minutos y configura tu perfil profesional con los datos de tu práctica.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configura tu consultorio",
    description: "Define horarios, tipos de cita, ubicaciones y reglas de disponibilidad a tu medida.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Recibe citas",
    description: "Tus pacientes agendan en línea viendo tu disponibilidad real, sin llamadas ni esperas.",
  },
  {
    icon: Smile,
    number: "04",
    title: "Gestiona todo",
    description: "Atiende pacientes, registra consultas, revisa métricas y haz crecer tu práctica.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comienza en 4 pasos simples
          </h2>
          <p className="text-muted-foreground text-lg">
            Desde el registro hasta la primera cita, en cuestión de minutos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Paso {step.number}
              </span>
              <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
