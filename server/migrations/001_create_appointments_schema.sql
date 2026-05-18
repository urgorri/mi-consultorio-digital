-- Initial schema for appointments module compatible with PostgreSQL

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    patient_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    status TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

CREATE TABLE IF NOT EXISTS appointment_tokens (
    token TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL REFERENCES appointments(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_tokens_appointment ON appointment_tokens(appointment_id);

CREATE TABLE IF NOT EXISTS appointment_status_history (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL REFERENCES appointments(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    reason TEXT NOT NULL,
    correlation_id TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appointment ON appointment_status_history(appointment_id);

CREATE TABLE IF NOT EXISTS weekly_availability (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_id TEXT NOT NULL,
    UNIQUE(tenant_id, professional_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS availability_exceptions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    kind TEXT NOT NULL,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS professional_appointment_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    appointment_type_id TEXT NOT NULL,
    duration INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL
);
