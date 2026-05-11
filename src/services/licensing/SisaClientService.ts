/**
 * SISA GWT-RPC Client Service
 * Migrated from Laravel to Node.js/TypeScript
 */

export interface SisaProfessionalData {
  sisa_list_id: string | null;
  sisa_file_id: string | null;
  documento_tipo_string: string | null;
  documento: string | null;
  nombre_completo: string | null;
  sexo: string | null;
  grupo_etario: string | null;
  matriculas: {
    profesion: string | null;
    numero: string | null;
    lugar: string | null;
  }[];
  fecha_nacimiento: string | null;
  nacionalidad: string | null;
  error?: string;
}

export class SisaClientService {
  private baseUrl: string = 'https://sisa.msal.gov.ar/sisa/sisa';
  private permutation: string = '025B1794109472CAB7119B033D2DCA91';
  private cookieHeader: string | null = null;

  constructor() {
    if (!this.baseUrl || !this.permutation) {
      throw new Error('SISA base URL or permutation is not configured.');
    }
  }

  /**
   * Makes a request to a SISA GWT-RPC endpoint.
   */
  private async request(endpoint: string, body: string): Promise<string> {
    if (this.cookieHeader === null && endpoint !== '/dispatch') {
      throw new Error('The getCookie() method must be called first.');
    }

    const headers: Record<string, string> = {
      'Accept': '*/*',
      'Accept-Language': 'es-AR,es-ES;q=0.9,es;q=0.8',
      'Connection': 'keep-alive',
      'Content-Type': 'text/x-gwt-rpc; charset=UTF-8',
      'Origin': 'https://sisa.msal.gov.ar',
      'Referer': 'https://sisa.msal.gov.ar/sisa/',
      'X-GWT-Module-Base': `${this.baseUrl}/`,
      'X-GWT-Permutation': this.permutation,
    };

    if (this.cookieHeader) {
      headers['Cookie'] = this.cookieHeader;
    }

    const response = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`SISA request failed with status ${response.status}`);
    }

    const responseBody = await response.text();

    // Extract and store the cookie from the first response
    if (endpoint === '/dispatch') {
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        // Extract NAME=VALUE pairs
        const matches = setCookieHeader.match(/([^=;,\s]+=[^;,\s]+)/g);
        if (matches) {
          this.cookieHeader = matches.join('; ');
        }
      }
    }

    return responseBody;
  }

  /**
   * Establishes the session and gets the necessary cookie.
   */
  public async getCookie(): Promise<void> {
    const body = '7|0|6|https://sisa.msal.gov.ar/sisa/sisa/|D8DC548F2F669F9A9B73169D41351B44|net.customware.gwt.dispatch.client.standard.StandardDispatchService|execute|net.customware.gwt.dispatch.shared.Action|ar.gob.msal.sisa.shared.rpc.action.LoadEnvironmentAction/1047162293|1|2|3|4|1|5|6|';
    await this.request('/dispatch', body);
  }

  /**
   * Fetches the initial list data for a given DNI.
   */
  public async fetchFromList(dni: string): Promise<string> {
    const body = `7|0|13|https://sisa.msal.gov.ar/sisa/sisa/|53A381980105A341FBFC4F2B74D5934B|ar.gob.msal.sisa.client.commons.components.lista.service.ListService|getPage|java.lang.Integer/3438268394|java.util.List|Z|ar.gob.msal.sisa.shared.model.list.ComplexFilter/30068811|java.util.ArrayList/4159755760|ar.gob.msal.sisa.client.commons.components.lista.simple.SearchFilter/1978531670|21003|ar.gob.msal.sisa.client.entitys.list.Filter$OPERATION/3408968308|${dni}|1|2|3|4|10|5|5|5|6|6|5|7|5|6|8|5|80|5|1|-2|9|1|10|11|12|0|0|0|13|0|9|0|0|1|5|25|0|0|`;
    return await this.request('/service/list', body);
  }

  /**
   * Fetches the detailed professional file using its ID.
   */
  public async fetchFromFile(id: string): Promise<string> {
    const body = `7|0|6|https://sisa.msal.gov.ar/sisa/sisa/|66EDF0151866E1DC37117CA635F400C9|ar.gob.msal.sisa.client.profesion.ficha.service.ProfesionalFileService|loadFile|java.lang.String/2004016611|${id}|1|2|3|4|1|5|6|`;
    return await this.request('/service/profesionalFile', body);
  }

  /**
   * Parses the GWT-RPC response to extract the JSON-like array.
   */
  public parseJsonFromGwt(raw: string | null): any[] | null {
    if (!raw) return null;

    const match = raw.match(/\[.*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Error parsing SISA JSON:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Orchestrates the complete call: get list -> extract ID -> get file.
   */
  public async getProfessionalDataByDni(dni: string): Promise<{ list: any[] | null; file: any[] | null; error?: string }> {
    try {
      await this.getCookie();

      const rawList = await this.fetchFromList(dni);
      const listData = this.parseJsonFromGwt(rawList);

      const fileId = listData?.[7] ?? null;

      if (!listData || !fileId) {
        return {
          list: listData,
          file: null,
          error: 'No SISA file ID found for the provided DNI.',
        };
      }

      const rawFile = await this.fetchFromFile(fileId);
      const fileData = this.parseJsonFromGwt(rawFile);

      return {
        list: listData,
        file: fileData,
      };
    } catch (e: any) {
      return {
        list: null,
        file: null,
        error: e.message || 'An external service error occurred.',
      };
    }
  }

  /**
   * Orchestrates the full process and formats the final data.
   */
  public async getFormattedProfessionalDataByDni(dni: string): Promise<SisaProfessionalData> {
    const raw = await this.getProfessionalDataByDni(dni);

    if (raw.error) {
      return { error: raw.error } as SisaProfessionalData;
    }

    const list = raw.list!;
    const file = raw.file!;

    // Fixed fields from the list response
    const out: SisaProfessionalData = {
      sisa_list_id: list[7] ?? null,
      sisa_file_id: list[8] ?? null,
      documento_tipo_string: list[9] ?? null,
      documento: list[10] ?? null,
      nombre_completo: list[11] ?? null,
      sexo: list[list.length - 3] ?? null,
      grupo_etario: list[list.length - 2] ?? null,
      matriculas: [],
      fecha_nacimiento: null,
      nacionalidad: null,
    };

    // 1) Extract all licenses (profession, number, location)
    let i = 6;
    while (file[i] !== undefined && typeof file[i] === 'string' && !file[i].startsWith('ar.gob.msal.sisa')) {
      out.matriculas.push({
        profesion: file[i === 6 ? i - 2 : i] ?? null,
        numero: file[i + 1] ?? null,
        lugar: file[i + 2] ?? null,
      });
      i += 3;
    }

    // 2) Find the index of "java.util.Date" to locate nearby fields
    let dateIndex = -1;
    for (let idx = 0; idx < file.length; idx++) {
      if (typeof file[idx] === 'string' && file[idx].includes('java.util.Date')) {
        dateIndex = idx;
        break;
      }
    }

    if (dateIndex !== -1) {
      out.fecha_nacimiento = file[dateIndex - 1] ?? null;
      out.nacionalidad = file[dateIndex + 1] ?? null;
    }

    return out;
  }
}
