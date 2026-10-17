import { notFound } from "next/navigation";
import { canManageGallery } from "@/lib/gallery/access";
import { isGalleryPreview } from "@/lib/gallery/policy";
import GalleryManager from "./gallery-manager";
export const dynamic = "force-dynamic";
export default async function GalleryPage() {
  if (!isGalleryPreview(process.env)) notFound();
  if (!await canManageGallery()) return <main className="p-6"><h1 className="text-2xl font-semibold">Galerie du site</h1><p className="mt-4">Connectez-vous avec un compte autorisé à publier dans la galerie Preview. Si votre compte n’est pas encore autorisé, son adresse doit être ajoutée au réglage serveur GALLERY_ADMIN_EMAILS de cette Preview.</p></main>;
  return <GalleryManager />;
}
