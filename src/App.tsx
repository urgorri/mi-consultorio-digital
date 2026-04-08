import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PasswordRecoveryPage from "./pages/PasswordRecoveryPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AgendaPage from "./pages/dashboard/AgendaPage";
import PatientsPage from "./pages/dashboard/PatientsPage";
import PatientDetailPage from "./pages/dashboard/PatientDetailPage";
import NewConsultationPage from "./pages/dashboard/NewConsultationPage";
import DiagnosesPage from "./pages/dashboard/DiagnosesPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-contrasena" element={<PasswordRecoveryPage />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/agenda" element={<AgendaPage />} />
          <Route path="/dashboard/pacientes" element={<PatientsPage />} />
          <Route path="/dashboard/pacientes/:id" element={<PatientDetailPage />} />
          <Route path="/dashboard/consultas" element={<NewConsultationPage />} />
          <Route path="/dashboard/consultas/nueva" element={<NewConsultationPage />} />
          <Route path="/dashboard/diagnosticos" element={<DiagnosesPage />} />
          <Route path="/dashboard/reportes" element={<ReportsPage />} />
          <Route path="/dashboard/notificaciones" element={<NotificationsPage />} />
          <Route path="/dashboard/configuracion" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
