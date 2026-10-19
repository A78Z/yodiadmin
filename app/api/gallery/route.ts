import mongoose from "mongoose";
import { createHash } from "node:crypto";
import { head } from "@vercel/blob";
import { connectDB } from "@/lib/db/dbase";
import { canManageGallery, galleryStorageReady } from "@/lib/gallery/access";
import { COLLECTION, isGalleryPreview, MAX_IMAGE, MAX_VIDEO, sameOrigin, validBlobUrl } from "@/lib/gallery/policy";

const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function collection() {
  await connectDB();
  if (!mongoose.connection.db) throw new Error("Database unavailable");
  return mongoose.connection.db.collection(COLLECTION);
}
async function permitted() {
  if (!isGalleryPreview(process.env)) return response({ error: "Indisponible" }, 404);
  if (!await canManageGallery()) return response({ error: "La galerie est réservée aux administrateurs autorisés pour la Preview." }, 403);
  return null;
}
export async function GET() {
  const denied = await permitted(); if (denied) return denied;
  try {
    const media = await (await collection()).find({}, { projection: { url: 1, thumbnail: 1, kind: 1, alt: 1, published: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(100).toArray();
    return response({ media, storageReady: galleryStorageReady() });
  } catch { return response({ error: "Impossible de charger la galerie. Réessayez." }, 503); }
}
export async function POST(request: Request) {
  const denied = await permitted(); if (denied) return denied;
  if (!sameOrigin(request)) return response({ error: "Origine refusée" }, 403);
  if (!galleryStorageReady()) return response({ error: "Le stockage de la galerie doit être connecté à la Preview." }, 503);
  try {
    const body = await request.json();
    const { kind, url, thumbnail } = body;
    const alt = typeof body.alt === "string" ? body.alt.trim().slice(0, 180) : "";
    if (!["photo", "video"].includes(kind) || !alt || !validBlobUrl(url, process.env.GALLERY_BLOB_HOST) || !validBlobUrl(thumbnail, process.env.GALLERY_BLOB_HOST)) return response({ error: "Média ou description invalide." }, 400);
    const [file, poster] = await Promise.all([head(url), head(thumbnail)]);
    const photoTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!(kind === "photo" ? photoTypes.includes(file.contentType) && file.size <= MAX_IMAGE : ["video/mp4", "video/webm"].includes(file.contentType) && file.size <= MAX_VIDEO)
      || !photoTypes.includes(poster.contentType) || poster.size > MAX_IMAGE || (kind === "photo" && url !== thumbnail)) return response({ error: "Le type ou la taille du fichier n’est pas autorisé." }, 400);
    const record = { kind, url, thumbnail, alt, published: true, createdAt: new Date(), updatedAt: new Date() };
    const id = new mongoose.Types.ObjectId(createHash("sha256").update(url).digest("hex").slice(0, 24));
    await (await collection()).updateOne({ _id: id }, { $setOnInsert: record }, { upsert: true });
    const saved = await (await collection()).findOne({ _id: id });
    return response({ media: saved }, 201);
  } catch { return response({ error: "La publication a échoué. Réessayez sans fermer le formulaire." }, 503); }
}
export async function PATCH(request: Request) {
  const denied = await permitted(); if (denied) return denied;
  if (!sameOrigin(request)) return response({ error: "Origine refusée" }, 403);
  try {
    const { id, published } = await request.json();
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id) || typeof published !== "boolean") return response({ error: "Modification invalide" }, 400);
    const result = await (await collection()).updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { published, updatedAt: new Date() } });
    if (!result.matchedCount) return response({ error: "Média introuvable" }, 404);
    return response({ success: true });
  } catch { return response({ error: "La modification n’a pas été enregistrée." }, 503); }
}
