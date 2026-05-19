import pg from 'pg';

export class PostgresAppointmentsRepository {
  constructor(connectionString) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async createAppointment(data) {
    const query = `
      INSERT INTO appointments(id, payload, patient_id, professional_id, status, date, time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        patient_id = EXCLUDED.patient_id,
        professional_id = EXCLUDED.professional_id,
        status = EXCLUDED.status,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        updated_at = NOW()
      RETURNING *
    `;
    const values = [
      data.id,
      JSON.stringify(data),
      data.patientId,
      data.professionalId,
      data.status,
      data.date,
      data.time
    ];
    await this.pool.query(query, values);
    return data;
  }

  async updateAppointment(id, data) {
    const query = `
      UPDATE appointments
      SET payload = $1, status = $2, date = $3, time = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING payload
    `;
    const result = await this.pool.query(query, [
      JSON.stringify(data),
      data.status,
      data.date,
      data.time,
      id
    ]);
    return result.rows[0]?.payload;
  }

  async getAppointmentById(id) {
    const query = `SELECT payload FROM appointments WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0]?.payload;
  }

  async listAppointmentsByProfessional(professionalId) {
    const query = `SELECT payload FROM appointments WHERE professional_id = $1 ORDER BY date, time`;
    const result = await this.pool.query(query, [professionalId]);
    return result.rows.map(r => r.payload);
  }

  async listAppointmentsByPatient(patientId) {
    const query = `SELECT payload FROM appointments WHERE patient_id = $1 ORDER BY date, time`;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(r => r.payload);
  }

  async findAppointmentByToken(token) {
    const query = `
      SELECT a.payload
      FROM appointments a
      JOIN appointment_tokens t ON a.id = t.appointment_id
      WHERE t.token = $1 AND t.expires_at > NOW()
    `;
    const result = await this.pool.query(query, [token]);
    if (result.rows.length === 0) return null;
    return result.rows[0].payload;
  }

  async saveAccessToken(t) {
    const query = `
      INSERT INTO appointment_tokens(token, appointment_id, expires_at, permissions)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (token) DO UPDATE SET
        appointment_id = EXCLUDED.appointment_id,
        expires_at = EXCLUDED.expires_at,
        permissions = EXCLUDED.permissions
    `;
    await this.pool.query(query, [t.token, t.appointmentId, t.expiresAt, JSON.stringify(t.permissions)]);
  }

  async findTokenByAppointmentId(appointmentId) {
    const query = `SELECT * FROM appointment_tokens WHERE appointment_id = $1`;
    const result = await this.pool.query(query, [appointmentId]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      token: row.token,
      appointmentId: row.appointment_id,
      expiresAt: row.expires_at,
      permissions: row.permissions
    };
  }

  async saveStatusHistory(h) {
    const query = `
      INSERT INTO appointment_status_history(
        id, appointment_id, timestamp, previous_status, new_status,
        actor_id, actor_name, actor_role, reason, correlation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (correlation_id) DO NOTHING
    `;
    const values = [
      h.id, h.appointmentId, h.timestamp, h.previousStatus, h.newStatus,
      h.actor.id, h.actor.name, h.actor.role, h.reason, h.correlationId
    ];
    await this.pool.query(query, values);
  }

  async listStatusHistory(appointmentId) {
    const query = `SELECT * FROM appointment_status_history WHERE appointment_id = $1 ORDER BY timestamp ASC`;
    const result = await this.pool.query(query, [appointmentId]);
    return result.rows.map(r => ({
      id: r.id,
      appointmentId: r.appointment_id,
      timestamp: r.timestamp,
      previousStatus: r.previous_status,
      newStatus: r.new_status,
      actor: { id: r.actor_id, name: r.actor_name, role: r.actor_role },
      reason: r.reason,
      correlationId: r.correlation_id
    }));
  }

  async listWeeklyAvailability(tenantId, professionalId) {
    const query = `SELECT * FROM weekly_availability WHERE tenant_id = $1 AND professional_id = $2`;
    const result = await this.pool.query(query, [tenantId, professionalId]);
    return result.rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      professionalId: r.professional_id,
      dayOfWeek: r.day_of_week,
      enabled: r.enabled,
      startTime: r.start_time,
      endTime: r.end_time,
      locationId: r.location_id
    }));
  }

  async upsertWeeklyAvailability(entries) {
    const query = `
      INSERT INTO weekly_availability(id, tenant_id, professional_id, day_of_week, enabled, start_time, end_time, location_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id, professional_id, day_of_week) DO UPDATE SET
        enabled = EXCLUDED.enabled,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        location_id = EXCLUDED.location_id
    `;
    for (const e of entries) {
      const id = e.id || `wa-${e.tenantId}-${e.professionalId}-${e.dayOfWeek}`;
      await this.pool.query(query, [id, e.tenantId, e.professionalId, e.dayOfWeek, e.enabled, e.startTime, e.endTime, e.locationId]);
    }
  }

  async listAvailabilityExceptions(tenantId, professionalId, date) {
    const query = `SELECT * FROM availability_exceptions WHERE tenant_id = $1 AND professional_id = $2 AND date = $3`;
    const result = await this.pool.query(query, [tenantId, professionalId, date]);
    return result.rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      professionalId: r.professional_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      kind: r.kind,
      reason: r.reason
    }));
  }

  async listProfessionalAppointmentTypes(tenantId, professionalId) {
    const query = `SELECT * FROM professional_appointment_types WHERE tenant_id = $1 AND professional_id = $2`;
    const result = await this.pool.query(query, [tenantId, professionalId]);
    return result.rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      professionalId: r.professional_id,
      appointmentTypeId: r.appointment_type_id,
      duration: r.duration,
      enabled: r.enabled
    }));
  }
}
