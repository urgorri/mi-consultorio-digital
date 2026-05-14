import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-primary">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Comienza a gestionar tu consultorio hoy
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8">
          Únete a cientos de profesionales que ya simplifican su práctica médica
          con MiConsultorio. Sin complicaciones, sin contratos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/registro">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              Crear cuenta gratuita
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/agendar">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 w-full sm:w-auto"
            >
              <CalendarCheck className="w-4 h-4" />
              Ver demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
