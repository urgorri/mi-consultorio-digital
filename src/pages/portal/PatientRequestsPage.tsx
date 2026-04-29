import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { patientPortalApi } from "@/services/api";
import type { ProfessionalPatientRequest } from "@/services/api";
import { User, Check, X, Calendar, MapPin, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Expirada",
};

const PatientRequestsPage = () => {
  const [requests, setRequests] = useState<ProfessionalPatientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await patientPortalApi.getRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await patientPortalApi.acceptRequest(requestId);
      toast.success("Solicitud aceptada exitosamente");
      loadRequests();
    } catch (error) {
      toast.error("Error al aceptar la solicitud");
      console.error(error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await patientPortalApi.rejectRequest(requestId);
      toast.success("Solicitud rechazada");
      loadRequests();
    } catch (error) {
      toast.error("Error al rechazar la solicitud");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PatientPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes de Profesionales</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de acceso a tu historial clínico
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-muted-foreground">
                Cuando un profesional solicite acceso a tu historial, aparecerá aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Solicitud de acceso
                      </CardTitle>
                      <CardDescription>
                        Enviada el {formatDate(request.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border ${statusColors[request.status]}`}
                    >
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>ID Profesional: {request.professionalId}</span>
                  </div>
                  {request.clinicId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Clínica ID: {request.clinicId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Expira: {request.expiresAt ? formatDate(request.expiresAt) : "N/A"}
                    </span>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 gap-2 bg-success hover:bg-success/90"
                      >
                        <Check className="w-4 h-4" />
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="outline"
                        className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {request.status === "accepted" && (
                    <div className="flex items-center gap-2 text-success">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Has autorizado a este profesional para acceder a tu historial
                      </span>
                    </div>
                  )}

                  {request.status === "rejected" && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Solicitud rechazada. El profesional no tendrá acceso a tu historial.
                      </span>
                    </div>
                  )}

                  {request.status === "expired" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Esta solicitud ha expirado
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PatientPortalLayout>
  );
};

export default PatientRequestsPage;