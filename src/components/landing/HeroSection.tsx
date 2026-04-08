import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck, Shield, Clock } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in-up">
              <Shield className="w-4 h-4" />
              Plataforma médica de confianza
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up-delay-1">
              Gestiona tu práctica médica con{" "}
              <span className="text-gradient">simplicidad</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in-up-delay-2">
              Agenda citas, administra pacientes, registra consultas clínicas y
              ofrece una experiencia profesional desde cualquier dispositivo.
              Todo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-in-up-delay-3">
              <Link to="/registro">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/agendar">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <CalendarCheck className="w-4 h-4" />
                  Agendar cita
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                Configuración en minutos
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                Datos protegidos
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Consultorio médico moderno"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">+2,400 citas</p>
                  <p className="text-xs text-muted-foreground">gestionadas este mes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
