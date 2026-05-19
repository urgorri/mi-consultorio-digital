import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PostgresAppointmentsRepository } from './postgresRepository.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const repo = new PostgresAppointmentsRepository(process.env.DATABASE_URL || 'postgresql://localhost:5432/appointments');

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'appointments-backend' });
});

// --- Public API v1 ---

app.get('/api/appointments-public/v1/availability', async (req, res) => {
  try {
    const { professionalId, date } = req.query;
    // In a real implementation, this would query the repo for schedules and exceptions
    const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/appointments-public/v1/reservations', async (req, res) => {
  try {
    const data = req.body;
    const appointmentId = `apt-${Date.now()}`;
    const newAppointment = {
      ...data,
      id: appointmentId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await repo.createAppointment(newAppointment);
    res.json({ success: true, data: { id: appointmentId, status: 'pending' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/appointments-public/v1/reservations/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const appointment = await repo.findAppointmentByToken(token);
    if (!appointment) return res.status(404).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token no válido' } });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/appointments-public/v1/reservations/token/:token/confirm', async (req, res) => {
  try {
    const { token } = req.params;
    const appointment = await repo.findAppointmentByToken(token);
    if (!appointment) return res.status(404).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token no válido' } });

    const previousStatus = appointment.status;
    appointment.status = 'confirmed';
    await repo.updateAppointment(appointment.id, appointment);

    await repo.saveStatusHistory({
      id: `hist-${Date.now()}`,
      appointmentId: appointment.id,
      timestamp: new Date().toISOString(),
      previousStatus,
      newStatus: 'confirmed',
      actor: { id: 'patient', name: 'Paciente', role: 'paciente' },
      reason: 'Confirmación por token',
      correlationId: `pub-conf-${Date.now()}`
    });

    res.json({ success: true, data: { id: appointment.id, status: 'confirmed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/appointments-public/v1/reservations/token/:token/cancel', async (req, res) => {
  try {
    const { token } = req.params;
    const appointment = await repo.findAppointmentByToken(token);
    if (!appointment) return res.status(404).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token no válido' } });

    const previousStatus = appointment.status;
    appointment.status = 'cancelled';
    await repo.updateAppointment(appointment.id, appointment);

    await repo.saveStatusHistory({
      id: `hist-${Date.now()}`,
      appointmentId: appointment.id,
      timestamp: new Date().toISOString(),
      previousStatus,
      newStatus: 'cancelled',
      actor: { id: 'patient', name: 'Paciente', role: 'paciente' },
      reason: 'Cancelación por token',
      correlationId: `pub-canc-${Date.now()}`
    });

    res.json({ success: true, data: { id: appointment.id, status: 'cancelled' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Internal API v1 ---

app.get('/api/appointments/v1', async (req, res) => {
  try {
    const { professionalId } = req.query;
    const appointments = await repo.listAppointmentsByProfessional(professionalId);
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/appointments/v1', async (req, res) => {
  try {
    const data = req.body;
    const appointmentId = data.id || `apt-${Date.now()}`;
    const newAppointment = {
      ...data,
      id: appointmentId,
      status: data.status || 'scheduled'
    };
    await repo.createAppointment(newAppointment);

    await repo.saveStatusHistory({
      id: `hist-${Date.now()}`,
      appointmentId: appointmentId,
      timestamp: new Date().toISOString(),
      previousStatus: null,
      newStatus: newAppointment.status,
      actor: data.createdByActor || { id: 'system', name: 'Sistema', role: 'admin' },
      reason: 'Cita agendada',
      correlationId: data.correlationId || `create-${appointmentId}`
    });

    res.json({ success: true, data: newAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/appointments/v1/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await repo.getAppointmentById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

    const previousStatus = existing.status;
    const updated = { ...existing, ...req.body };
    await repo.updateAppointment(id, updated);

    if (updated.status !== previousStatus) {
       await repo.saveStatusHistory({
          id: `hist-${Date.now()}`,
          appointmentId: id,
          timestamp: new Date().toISOString(),
          previousStatus,
          newStatus: updated.status,
          actor: req.body.transitionActor || { id: 'system', name: 'Sistema', role: 'admin' },
          reason: req.body.transitionReason || 'Cambio de estado',
          correlationId: req.body.correlationId || `trans-${id}-${Date.now()}`
       });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/appointments/v1/availability', async (req, res) => {
  try {
    const { professionalId, date } = req.query;
    // Equiv to internal availability
    const slots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/appointments/v1/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await repo.listStatusHistory(id);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/appointments/v1/:id/signed-url', async (req, res) => {
  try {
    const { id } = req.params;
    const token = `token-${id}-${Date.now()}`;
    await repo.saveAccessToken({
      token,
      appointmentId: id,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      permissions: ['confirm', 'cancel']
    });
    res.json({ success: true, data: { url: `http://localhost:8080/citas/v/${token}` } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Booking API stubs ---

app.get('/api/booking/v1/doctors', async (req, res) => {
  res.json({ success: true, data: [
    { id: "prof-1", name: "Dra. María Pérez", specialty: "Medicina General" }
  ] });
});

app.get('/api/booking/v1/visit-types', async (req, res) => {
  res.json({ success: true, data: [
    { id: "1", name: "Primera vez", duration: 30 },
    { id: "2", name: "Seguimiento", duration: 15 }
  ] });
});

app.listen(port, () => {
  console.log(`Appointments backend listening at http://localhost:${port}`);
});
