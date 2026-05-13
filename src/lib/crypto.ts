/**
 * Utilidades de cifrado simulado para PII/PHI.
 * En un entorno real, esto utilizaría Web Crypto API con llaves derivadas del servidor.
 */

const ENC_PREFIX = "enc_";

/**
 * Cifra un valor de forma determinística (simulado).
 * Soporta caracteres UTF-8 (acentos, ñ, etc).
 */
export const encrypt = (value: string | undefined): string => {
  if (!value) return "";
  if (value.startsWith(ENC_PREFIX)) return value;

  try {
    // Usamos btoa con escape de URI para soportar UTF-8
    const encoded = btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return `${ENC_PREFIX}${encoded}`;
  } catch (e) {
    console.error("Encryption error:", e);
    return value;
  }
};

/**
 * Descifra un valor (simulado).
 */
export const decrypt = (value: string | undefined): string => {
  if (!value) return "";
  if (!value.startsWith(ENC_PREFIX)) return value;

  try {
    const base64 = value.substring(ENC_PREFIX.length);
    const decoded = decodeURIComponent(Array.prototype.map.call(atob(base64), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return decoded;
  } catch (e) {
    console.error("Decryption error:", e);
    return value;
  }
};

/**
 * Compara un valor en texto claro con uno cifrado (determinístico).
 */
export const compareEncrypted = (plain: string, encrypted: string): boolean => {
  if (!plain || !encrypted) return false;
  return encrypt(plain) === encrypted;
};
