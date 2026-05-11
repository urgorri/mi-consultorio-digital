import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SisaClientService } from '../SisaClientService';

describe('SisaClientService', () => {
  let service: SisaClientService;

  beforeEach(() => {
    service = new SisaClientService();
    // Mock global fetch
    global.fetch = vi.fn();
  });

  it('should parse GWT-RPC JSON correctly', () => {
    const raw = '//OK["data1","data2",123]';
    const parsed = service.parseJsonFromGwt(raw);
    expect(parsed).toEqual(["data1", "data2", 123]);
  });

  it('should handle invalid GWT-RPC response', () => {
    const raw = 'invalid response';
    const parsed = service.parseJsonFromGwt(raw);
    expect(parsed).toBeNull();
  });

  it('should format professional data correctly from mock GWT arrays', async () => {
    const mockList = [
      null, null, null, null, null, null, null,
      "list-id-123", "file-id-456", "DNI", "12345678", "JUAN PEREZ",
      "MASCULINO", "ADULTO"
    ];

    const mockFile = [
      null, null, null, null,
      "MEDICO", "PADRELL", "DUMMY", "9999", "BUENOS AIRES", // 4, 5, 6, 7, 8
      "ar.gob.msal.sisa.something", // index 9
      null, null, null, null, null,
      "1980-01-01", "java.util.Date/123", "ARGENTINO"
    ];

    // Mock getProfessionalDataByDni to return our mock arrays
    vi.spyOn(service, 'getProfessionalDataByDni').mockResolvedValue({
      list: mockList,
      file: mockFile
    });

    const data = await service.getFormattedProfessionalDataByDni("12345678");

    expect(data.documento).toBe("12345678");
    expect(data.nombre_completo).toBe("JUAN PEREZ");
    expect(data.matriculas).toHaveLength(1);
    expect(data.matriculas[0].numero).toBe("9999");
    expect(data.fecha_nacimiento).toBe("1980-01-01");
    expect(data.nacionalidad).toBe("ARGENTINO");
  });
});
