# Authorization matrix by endpoint/action

Roles: `admin`, `profesional`, `paciente`.

States: `active`, `suspended`, `blocked`.

| Module | Action | Admin | Profesional (active) | Profesional (suspended/blocked) | Paciente (self) |
|---|---|---:|---:|---:|---:|
| auth | session.login | ✅ | ✅ | ⚠️ (allowed, but restrictions may apply after login) | ✅ |
| identity | verification.read | ✅ | ✅ (assigned patients only) | ❌ | ✅ (own verification) |
| patients | patient.read | ✅ | ✅ (with active grant) | ❌ | ✅ (self) |
| patients | patient.update | ✅ | ✅ (with active grant) | ❌ | ✅ (limited profile fields) |
| professionals | license.invalidate | ✅ | ❌ | ❌ | ❌ |
| consents | consent.accept | ✅ | ✅ (capture + witness) | ❌ | ✅ |
| consents | consent.revoke | ✅ | ✅ (if delegated) | ❌ | ✅ |
| clinical-records | consultation.create | ✅ | ✅ (with active grant) | ❌ | ❌ |
| clinical-records | consultation.read | ✅ | ✅ (with active grant) | ❌ | ✅ (if policy allows) |
| audit | event.read | ✅ | ❌ | ❌ | ❌ |
| billing | invoice.read | ✅ | ✅ (clinic scope) | ❌ | ❌ |

> Nota: `suspended` y `blocked` deniegan acciones clínicas y acceso sensible.
