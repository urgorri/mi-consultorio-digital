const ENC_PREFIX = "enc_";
export const encrypt = (v: string | undefined): string | undefined => (!v || typeof v !== "string" || v.startsWith(ENC_PREFIX)) ? v : `${ENC_PREFIX}${btoa(v)}`;
export const decrypt = (v: string | undefined): string | undefined => (!v || typeof v !== "string" || !v.startsWith(ENC_PREFIX)) ? v : atob(v.substring(ENC_PREFIX.length));
export const encryptNormalized = (v: string | undefined): string | undefined => encrypt(v?.trim().toLowerCase());
