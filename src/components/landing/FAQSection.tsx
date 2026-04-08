import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuánto cuesta usar MiConsultorio?",
    answer:
      "Puedes comenzar gratis con las funcionalidades esenciales. Los planes profesionales incluyen características avanzadas como reportes, múltiples consultorios y API.",
  },
  {
    question: "¿Mis datos clínicos están seguros?",
    answer:
      "Sí. Toda la información se almacena de forma encriptada con autenticación segura, control de acceso por rol y registros de auditoría completos.",
  },
  {
    question: "¿Mis pacientes necesitan crear una cuenta?",
    answer:
      "Para agendar una cita los pacientes solo necesitan ingresar sus datos básicos. Opcionalmente pueden crear una cuenta para ver su historial y gestionar citas futuras.",
  },
  {
    question: "¿Puedo configurar múltiples consultorios?",
    answer:
      "Sí. Puedes agregar varias ubicaciones, cada una con sus propios horarios, tipos de cita y reglas de disponibilidad.",
  },
  {
    question: "¿Tienen API para integrar con otras aplicaciones?",
    answer:
      "Sí. MiConsultorio ofrece una REST API documentada con autenticación JWT y API keys para integrar con apps móviles, sistemas hospitalarios y otros servicios.",
  },
  {
    question: "¿Puedo personalizar los tipos de cita y su duración?",
    answer:
      "Por supuesto. Puedes crear tantos tipos de cita como necesites, cada uno con su propia duración, descripción y visibilidad para los pacientes.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Resolvemos tus dudas más comunes sobre la plataforma.
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
