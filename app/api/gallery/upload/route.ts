import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { canManageGallery, galleryStorageReady } from "@/lib/gallery/access";
import { isGalleryPreview, MAX_IMAGE, MAX_VIDEO, MIME_TYPES, sameOrigin, validGalleryPath } from "@/lib/gallery/policy";
export async function POST(request: Request) {
  if (!isGalleryPreview(process.env)) return Response.json({ error: "Indisponible" }, { status: 404 });
  if (!galleryStorageReady()) return Response.json({ error: "Le stockage de la galerie doit être connecté à la Preview." }, { status: 503 });
  try {
    const body: HandleUploadBody = await request.json();
    const result = await handleUpload({
      request, body,
      onBeforeGenerateToken: async (pathname) => {
        if (!sameOrigin(request) || !await canManageGallery() || !validGalleryPath(pathname)) throw new Error("Forbidden");
        const video = /\.(mp4|webm)$/.test(pathname);
        return {
          allowedContentTypes: MIME_TYPES.filter(type => type.startsWith(video ? "video/" : "image/")),
          maximumSizeInBytes: video ? MAX_VIDEO : MAX_IMAGE,
          addRandomSuffix: false, allowOverwrite: false,
        };
      },
      // No database write from a callback. Publication is a separate authenticated action.
      onUploadCompleted: async () => {},
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Envoi refusé. Vérifiez votre accès et le fichier choisi." }, { status: 400 });
  }
}
