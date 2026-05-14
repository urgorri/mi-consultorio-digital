import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contacto" className="bg-foreground text-background/70 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-background">MiConsultorio</span>
            </div>
            <p className="text-sm leading-relaxed">
              La plataforma médica que simplifica la gestión de tu práctica profesional.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-background mb-3 text-sm uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#caracteristicas" className="hover:text-background transition-colors">Características</a></li>
              <li><a href="#como-funciona" className="hover:text-background transition-colors">Cómo funciona</a></li>
              <li><a href="#faq" className="hover:text-background transition-colors">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-background mb-3 text-sm uppercase tracking-wider">Acceso</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-background transition-colors">Iniciar sesión</Link></li>
              <li><Link to="/registro" className="hover:text-background transition-colors">Crear cuenta</Link></li>
              <li><Link to="/agendar" className="hover:text-background transition-colors">Agendar cita</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-background mb-3 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>info@miconsultorio.ar</li>
                                        </ul>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} MiConsultorio. Todos los derechos reservados. Desarrollado por Gastón Urgorri.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
