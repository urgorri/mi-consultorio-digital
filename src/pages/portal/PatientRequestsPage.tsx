import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { patientPortalApi, consentApi, authApi } from "@/services/api";
import type { ProfessionalPatientRequest, ConsentDocument, AccessGrant } from "@/services/api";
import { User, Check, X, MapPin, Clock, AlertCircle, FileText, Shield, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProfessionalPatientRequest | null>(null);
  const [consentDoc, setConsentDoc] = useState<ConsentDocument | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [reqRes, grantRes] = await Promise.all([
        patientPortalApi.getRequests(),
        patientPortalApi.getAccessGrants(),
      ]);
      setRequests(reqRes.data);
      setGrants(grantRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = async (request: ProfessionalPatientRequest) => {
    setSelectedRequest(request);
    try {
      const docId = request.consentDocumentId || "consent-v1";
      const res = await consentApi.getDocument(docId);
      setConsentDoc(res.data);
      setConsentDialogOpen(true);
    } catch (error) {
      toast.error("No se pudo cargar el documento de consentimiento");
      console.error(error);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!confirm("¿Estás seguro de que deseas revocar este acceso? El profesional ya no podrá ver tu historial.")) return;
    try {
      await patientPortalApi.revokeAccessGrant(grantId);
      toast.success("Acceso revocado exitosamente");
      loadRequests();
    } catch (error) {
      toast.error("Error al revocar el acceso");
      console.error(error);
    }
  };

  const confirmAcceptance = async () => {
    if (!selectedRequest) return;
    setAccepting(true);
    try {
      await patientPortalApi.acceptRequest(selectedRequest.id, {
        method: "panel",
        ipAddress: "127.0.0.1", // In a real app, this would be captured server-side
        userAgent: navigator.userAgent,
      });
      toast.success("Solicitud y consentimiento aceptados");
      setConsentDialogOpen(false);
      loadRequests();
    } catch (error) {
      toast.error("Error al procesar la aceptación");
      console.error(error);
    } finally {
      setAccepting(false);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Privacidad y Accesos</h1>
          <p className="text-muted-foreground">
            Controla quién puede acceder a tu información de salud y gestiona tus consentimientos.
          </p>
        </div>

        {/* Access Grants Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Accesos Autorizados</h2>
          </div>

          {loading ? (
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
          ) : grants.filter(g => g.status === "active").length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 italic">No tienes accesos activos actualmente.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {grants.filter(g => g.status === "active").map((grant) => (
                <Card key={grant.id} className="border-success/20 bg-success/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-success/10 rounded-full">
                          <User className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">ID Profesional: {grant.professionalId}</p>
                          <p className="text-xs text-muted-foreground">
                            {grant.clinicId ? `Clínica: ${grant.clinicId}` : "Consulta Privada"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevoke(grant.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      <span>Autorizado el {formatDate(grant.grantedAt)}</span>
                      <Badge variant="outline" className="text-[10px] bg-white">Activo</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Pending Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <FileText className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
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
        ) : requests.filter(r => r.status === "pending").length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 italic">No tienes solicitudes pendientes.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.filter(r => r.status === "pending").map((request) => (
              <Card key={request.id} className="border-warning/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <User className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Solicitud de Acceso</CardTitle>
                        <CardDescription className="text-xs">ID: {request.professionalId}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-warning/5 text-warning text-[10px]">Pendiente</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{request.clinicId ? `Clínica ID: ${request.clinicId}` : "Consulta Privada"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expira el {request.expiresAt ? formatDate(request.expiresAt) : "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAcceptClick(request)}
                      size="sm"
                      className="flex-1 gap-1.5 bg-success hover:bg-success/90"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Autorizar
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </section>

        {/* History / Consent Logs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Historial de Decisiones</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Evento</th>
                      <th className="text-left p-3 font-medium">Profesional / Clínica</th>
                      <th className="text-left p-3 font-medium">Fecha</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-right p-3 font-medium">Trazabilidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {requests.filter(r => r.status !== "pending").map((request) => (
                      <tr key={request.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">Solicitud de acceso</td>
                        <td className="p-3">
                          <p className="font-medium">{request.professionalId}</p>
                          <p className="text-xs text-muted-foreground">{request.clinicId || "Privada"}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{formatDate(request.createdAt)}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] ${statusColors[request.status]}`}>
                            {statusLabels[request.status]}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {grants.filter(g => g.status === "revoked").map((grant) => (
                      <tr key={grant.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-destructive">Acceso Revocado</td>
                        <td className="p-3">
                          <p className="font-medium">{grant.professionalId}</p>
                          <p className="text-xs text-muted-foreground">{grant.clinicId || "Privada"}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{grant.revokedAt ? formatDate(grant.revokedAt) : "N/A"}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] border-destructive/20 text-destructive bg-destructive/5">
                            Revocado
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {consentDoc?.title || "Consentimiento Informado"}
            </DialogTitle>
            <DialogDescription>
              Versión {consentDoc?.version} • Publicado el {consentDoc && formatDate(consentDoc.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/30 p-4 rounded-lg border text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
            {consentDoc?.content}
          </div>

          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs text-muted-foreground">
            <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Al hacer clic en "Aceptar y autorizar", confirmas que has leído y aceptas los términos de este consentimiento.
              Se registrará tu dirección IP y agente de usuario para fines de trazabilidad y auditoría.
              <strong> Hash de versión: {consentDoc?.versionHash}</strong>
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setConsentDialogOpen(false)}
              disabled={accepting}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAcceptance}
              className="gap-2"
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Aceptar y autorizar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientPortalLayout>
  );
};

export default PatientRequestsPage;