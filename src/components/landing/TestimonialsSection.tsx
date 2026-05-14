import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dra. María Pérez",
    role: "Medicina General",
    content:
      "MiConsultorio transformó mi práctica. Mis pacientes agendan solos y yo me enfoco en lo que importa: atenderlos bien.",
    rating: 5,
  },
  {
    name: "Dr. Julián Mendoza",
    role: "Pediatría",
    content:
      "La agenda es increíblemente intuitiva. Configuré mis horarios en minutos y reduje un 70% las llamadas para agendar.",
    rating: 5,
  },
  {
    name: "Dra. Ana López",
    role: "Dermatología",
    content:
      "El módulo de consultas clínicas es exactamente lo que necesitaba. Todo organizado, rápido y profesional.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Profesionales que confían en nosotros
          </h2>
          <p className="text-muted-foreground text-lg">
            Médicos de diferentes especialidades ya gestionan su práctica con MiConsultorio.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-xl border border-border bg-background"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">"{t.content}"</p>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
