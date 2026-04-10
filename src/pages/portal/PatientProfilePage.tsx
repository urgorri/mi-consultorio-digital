import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { patientPortalApi } from "@/services/api";
import type { Patient } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, User } from "lucide-react";

const PatientProfilePage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientPortalApi.getProfile().then(res => {
      setPatient(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !patient) {
    return (
      <PatientPortalLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </PatientPortalLayout>
    );
  }

  return (
    <PatientPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>
          <p className="text-sm text-muted-foreground">Administra tu información personal</p>
        </div>

        <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{patient.firstName} {patient.lastName}</p>
            <p className="text-sm text-muted-foreground">{patient.email}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Datos personales</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input defaultValue={patient.firstName} />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input defaultValue={patient.lastName} />
            </div>
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input defaultValue={patient.email} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input defaultValue={patient.phone} />
            </div>
            <div className="space-y-2">
              <Label>Fecha de nacimiento</Label>
              <Input defaultValue={new Date(patient.birthDate).toLocaleDateString("es-MX")} />
            </div>
            <div className="space-y-2">
              <Label>Género</Label>
              <Input defaultValue={patient.gender} />
            </div>
            <div className="col-span-full space-y-2">
              <Label>Dirección</Label>
              <Input defaultValue={patient.address} />
            </div>
          </div>
          <Button className="gap-1">
            <Save className="w-4 h-4" /> Guardar cambios
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Información médica</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de sangre</Label>
              <Input defaultValue={patient.bloodType} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Alergias</Label>
              <Input defaultValue={patient.allergies} readOnly className="bg-muted" />
            </div>
            <div className="col-span-full space-y-2">
              <Label>Condiciones</Label>
              <Input defaultValue={patient.conditions} readOnly className="bg-muted" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Esta información solo puede ser modificada por tu profesional de salud.</p>
        </div>
      </div>
    </PatientPortalLayout>
  );
};

export default PatientProfilePage;
