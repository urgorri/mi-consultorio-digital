import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClinicFilterProvider } from "@/contexts/ClinicFilterContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPacientePage from "./pages/auth/LoginPacientePage";
import LoginProfesionalPage from "./pages/auth/LoginProfesionalPage";
import LoginAdminPage from "./pages/auth/LoginAdminPage";
import RegisterPacientePage from "./pages/auth/RegisterPacientePage";
import RegisterProfesionalPage from "./pages/auth/RegisterProfesionalPage";
import PasswordRecoveryPage from "./pages/PasswordRecoveryPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AgendaPage from "./pages/dashboard/AgendaPage";
import PatientsPage from "./pages/dashboard/PatientsPage";
import PatientDetailPage from "./pages/dashboard/PatientDetailPage";
import NewConsultationPage from "./pages/dashboard/NewConsultationPage";
import ConsultationDetailPage from "./pages/dashboard/ConsultationDetailPage";
import ConsultationsListPage from "./pages/dashboard/ConsultationsListPage";
import DiagnosesPage from "./pages/dashboard/DiagnosesPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PatientDashboardPage from "./pages/portal/PatientDashboardPage";
import PatientHistoryPage from "./pages/portal/PatientHistoryPage";
import PatientNotificationsPage from "./pages/portal/PatientNotificationsPage";
import PatientProfilePage from "./pages/portal/PatientProfilePage";
import PatientAppointmentDetailPage from "./pages/portal/PatientAppointmentDetailPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClinicFilterProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/paciente" element={<LoginPacientePage />} />
              <Route path="/login/profesional" element={<LoginProfesionalPage />} />
              <Route path="/login/admin" element={<LoginAdminPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/registro/paciente" element={<RegisterPacientePage />} />
              <Route path="/registro/profesional" element={<RegisterProfesionalPage />} />
              <Route path="/recuperar-contrasena" element={<PasswordRecoveryPage />} />
              <Route path="/agendar" element={<BookingPage />} />

              {/* Professional Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["profesional"]}><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/agenda" element={<ProtectedRoute allowedRoles={["profesional"]}><AgendaPage /></ProtectedRoute>} />
              <Route path="/dashboard/pacientes" element={<ProtectedRoute allowedRoles={["profesional"]}><PatientsPage /></ProtectedRoute>} />
              <Route path="/dashboard/pacientes/:id" element={<ProtectedRoute allowedRoles={["profesional"]}><PatientDetailPage /></ProtectedRoute>} />
              <Route path="/dashboard/consultas" element={<ProtectedRoute allowedRoles={["profesional"]}><ConsultationsListPage /></ProtectedRoute>} />
              <Route path="/dashboard/consultas/nueva" element={<ProtectedRoute allowedRoles={["profesional"]}><NewConsultationPage /></ProtectedRoute>} />
              <Route path="/dashboard/consultas/:id" element={<ProtectedRoute allowedRoles={["profesional"]}><ConsultationDetailPage /></ProtectedRoute>} />
              <Route path="/dashboard/diagnosticos" element={<ProtectedRoute allowedRoles={["profesional"]}><DiagnosesPage /></ProtectedRoute>} />
              <Route path="/dashboard/reportes" element={<ProtectedRoute allowedRoles={["profesional"]}><ReportsPage /></ProtectedRoute>} />
              <Route path="/dashboard/notificaciones" element={<ProtectedRoute allowedRoles={["profesional"]}><NotificationsPage /></ProtectedRoute>} />
              <Route path="/dashboard/configuracion" element={<ProtectedRoute allowedRoles={["profesional"]}><SettingsPage /></ProtectedRoute>} />

              {/* Patient Portal */}
              <Route path="/portal" element={<ProtectedRoute allowedRoles={["paciente"]}><PatientDashboardPage /></ProtectedRoute>} />
              <Route path="/portal/historial" element={<ProtectedRoute allowedRoles={["paciente"]}><PatientHistoryPage /></ProtectedRoute>} />
              <Route path="/portal/notificaciones" element={<ProtectedRoute allowedRoles={["paciente"]}><PatientNotificationsPage /></ProtectedRoute>} />
              <Route path="/portal/perfil" element={<ProtectedRoute allowedRoles={["paciente"]}><PatientProfilePage /></ProtectedRoute>} />
              <Route path="/portal/citas/:id" element={<ProtectedRoute allowedRoles={["paciente"]}><PatientAppointmentDetailPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSystemPage /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/auditoria" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAuditPage /></ProtectedRoute>} />
              <Route path="/admin/notificaciones" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotificationsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClinicFilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
