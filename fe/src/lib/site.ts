/** Endereço público do site: base dos links canónicos, do sitemap e das imagens de partilha. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://veloz-conquista.vercel.app").replace(/\/$/, "");

/** Servidor das fotos (Azure Blob Storage). */
export const IMAGE_HOST = "https://velozconquistastorage.blob.core.windows.net";
