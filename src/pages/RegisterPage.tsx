import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6">
        <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
        <p className="text-muted-foreground mb-6">Selecciona el tipo de cuenta para registrarte.</p>
        <div className="grid gap-3">
          <Link to="/registro/paciente" className="rounded-lg border p-3 hover:bg-muted">Registro Paciente</Link>
          <Link to="/registro/profesional" className="rounded-lg border p-3 hover:bg-muted">Registro Profesional</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
