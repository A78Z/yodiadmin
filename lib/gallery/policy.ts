export const COLLECTION = "yodi_gallery_preview_refonte";
export const PREFIX = "gallery/refonte/";
export const MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
export const MAX_IMAGE = 8 * 1024 * 1024;
export const MAX_VIDEO = 100 * 1024 * 1024;
export function isGalleryPreview(env: Record<string, string | undefined>) {
  return env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === "refonte";
}
export function galleryAdmin(email: unknown, allowlist = "") {
  return typeof email === "string" && allowlist.split(",").map(value => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
export function validGalleryPath(path: string) {
  return /^gallery\/refonte\/[a-f0-9-]{36}\.(jpg|png|webp|mp4|webm)$/.test(path);
}
export function validBlobUrl(value: unknown, host: string | undefined) {
  if (typeof value !== "string" || !host || !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(host)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === host && !url.port && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith(`/${PREFIX}`);
  } catch { return false; }
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
