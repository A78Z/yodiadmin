import "server-only";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/option";
import { galleryAdmin, isGalleryPreview } from "./policy";
export async function canManageGallery() {
  if (!isGalleryPreview(process.env)) return false;
  const session = await getServerSession(options);
  return galleryAdmin(session?.user?.email, process.env.GALLERY_ADMIN_EMAILS);
}
export function galleryStorageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(process.env.GALLERY_BLOB_HOST || ""));
}
