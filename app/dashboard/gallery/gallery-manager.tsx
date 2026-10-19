"use client";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Film, LoaderCircle, Eye, EyeOff, Upload } from "lucide-react";
import { MAX_IMAGE, MAX_VIDEO, MIME_TYPES } from "@/lib/gallery/policy";
import styles from "./gallery.module.css";

type Media = { _id: string; kind: "photo" | "video"; url: string; thumbnail: string; alt: string; published: boolean };
export default function GalleryManager() {
  const [items, setItems] = useState<Media[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  // Keep successful uploads after a publication failure so retrying does not upload them again.
  const uploaded = useRef<{ file: File; poster: File | null; url: string; thumbnail: string } | null>(null);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" }); const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chargement impossible.");
      setItems(data.media); setReady(data.storageReady);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  function choose(next: File | null, cover = false) {
    if (!next) return;
    const limit = next.type.startsWith("video/") && !cover ? MAX_VIDEO : MAX_IMAGE;
    if (!MIME_TYPES.includes(next.type) || cover && !next.type.startsWith("image/") || next.size > limit) { setError("Choisissez une photo JPG, PNG ou WebP de 8 Mo maximum, ou une vidéo MP4/WebM de 100 Mo maximum."); return; }
    setError(""); setMessage(""); uploaded.current = null;
    if (cover) setPoster(next); else { setFile(next); setPoster(null); }
  }
  async function sendFile(value: File) {
    const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>)[value.type];
    const result = await upload(`gallery/refonte/${crypto.randomUUID()}.${ext}`, value, {
      access: "public", handleUploadUrl: "/api/gallery/upload", multipart: value.size > 4 * 1024 * 1024,
      contentType: value.type, onUploadProgress: event => setProgress(Math.round(event.percentage)),
    });
    return result.url;
  }
  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || !file || busy) return;
    const video = file.type.startsWith("video/");
    if (video && !poster) { setError("Ajoutez une image de couverture pour la vidéo."); return; }
    setBusy(true); setError(""); setMessage(""); setProgress(0);
    try {
      if (!uploaded.current || uploaded.current.file !== file || uploaded.current.poster !== poster) {
        const url = await sendFile(file);
        const thumbnail = video ? await sendFile(poster!) : url;
        uploaded.current = { file, poster, url, thumbnail };
      }
      const res = await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: video ? "video" : "photo", url: uploaded.current.url, thumbnail: uploaded.current.thumbnail, alt }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Publication impossible.");
      setItems(current => [data.media, ...current]); setFile(null); setPoster(null); setAlt(""); uploaded.current = null;
      if (input.current) input.current.value = "";
      if (posterInput.current) posterInput.current.value = "";
      setMessage("Média publié dans la galerie Preview. L’accueil se met à jour sous une minute.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "L’envoi a échoué. Réessayez."); }
    finally { setBusy(false); }
  }
  async function toggle(item: Media) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/gallery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item._id, published: !item.published }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Modification impossible.");
      setItems(current => current.map(value => value._id === item._id ? { ...value, published: !value.published } : value));
      setMessage(item.published ? "Média masqué dans la galerie Preview." : "Média publié dans la galerie Preview.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Modification impossible."); }
    finally { setBusy(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><p className={styles.eyebrow}>MAISON YODI-K · PREVIEW REFONTE</p><h1>La galerie <em>de la maison.</em></h1><p>Vos photos, vos vidéos, vos rituels. Publiez les médias qui racontent Yodi-K.</p></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.notice} role="status">{message}</p>}
    {loading ? <p role="status">Chargement de la galerie…</p> : <>
      {!ready && <p className={styles.notice}>Le stockage des médias doit être connecté à cette Preview avant le premier envoi.</p>}
      <form onSubmit={publish} className={styles.editor}>
        <div><h2>Ajouter une photo ou une vidéo</h2><p className={styles.help}>Photos JPG, PNG, WebP · 8 Mo maximum. Vidéos MP4, WebM · 100 Mo maximum. Les fichiers envoyés sont publics.</p>
          <label className={styles.file}><Upload size={22} aria-hidden="true"/><span>Choisir un fichier</span><input ref={input} type="file" accept={MIME_TYPES.join(",")} disabled={!ready || busy} onChange={event => choose(event.target.files?.[0] || null)} /></label>
          {file && <p className={styles.help}>{file.name}</p>}
          {file?.type.startsWith("video/") && <label className={styles.field}>Image de couverture<input ref={posterInput} type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy} onChange={event => choose(event.target.files?.[0] || null, true)}/></label>}
          <label className={styles.field}>Description accessible<input value={alt} onChange={event => setAlt(event.target.value)} maxLength={180} required placeholder="Ex. Notre huile pour cheveux Yodi-K" disabled={!ready || busy}/><span className={styles.help}>Décrivez le média pour les personnes qui ne peuvent pas le voir.</span></label>
          <button className={styles.primary} disabled={!ready || !file || busy} type="submit">{busy ? <LoaderCircle size={18} className={styles.spinner}/> : <ImagePlus size={18}/>} {busy ? `Envoi en cours · ${progress} %` : "Publier dans la galerie Preview"}</button>
        </div>
        <div className={styles.preview}>{preview ? file?.type.startsWith("video/") ? <video key={preview} src={preview} controls playsInline preload="none" aria-label="Aperçu de la vidéo choisie"/> : <img src={preview} alt="Aperçu de la photo choisie"/> : <div><Film size={30} aria-hidden="true"/><p>Votre aperçu apparaîtra ici.</p></div>}</div>
      </form>
      <section aria-labelledby="gallery-items"><h2 id="gallery-items">Vos médias <span className={styles.help}>({items.length})</span></h2>{!items.length ? <p className={styles.help}>Ajoutez votre premier média. Les photos du catalogue restent affichées sur l’accueil en attendant.</p> : <ul className={styles.grid}>{items.map(item => <li key={item._id} className={styles.card}><img src={item.thumbnail} alt={item.alt} loading="lazy"/><div><p>{item.alt}</p><p className={styles.help}>{item.kind === "video" ? "Vidéo" : "Photo"} · {item.published ? "Publié en Preview" : "Masqué"}</p><button disabled={busy} onClick={() => void toggle(item)} className={styles.secondary}>{item.published ? <EyeOff size={16}/> : <Eye size={16}/>} {item.published ? "Masquer" : "Publier en Preview"}</button></div></li>)}</ul>}</section>
    </>}
  </main>;
}
