"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import DropZoneFile from "@/components/portale/figli/DropZoneFile";
import type { Bambino } from "@/lib/airtable-portale";

async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((res) => { image.onload = () => res(); });
  const canvas = document.createElement("canvas");
  const size = 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, size, size,
  );
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas blob failed"))), "image/jpeg", 0.9),
  );
}

interface Props {
  bambino: Bambino;
}

export default function TabFoto({ bambino }: Props) {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fotoUrl = bambino.fields.FOTO_BAMBINO?.[0]?.url;
  const initials = `${bambino.fields.NOME_BAMBINO?.[0] ?? ""}${bambino.fields.COGNOME_BAMBINO?.[0] ?? ""}`.toUpperCase();

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  function handleDropFile(file: File) {
    const url = URL.createObjectURL(file);
    setSrcImage(url);
  }

  async function handleUpload() {
    if (!srcImage || !croppedArea) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await getCroppedBlob(srcImage, croppedArea);
      const formData = new FormData();
      formData.append("file", blob, "foto.jpg");
      const res = await fetch(`/api/portale/bambini/${bambino.id}/foto`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Errore durante il caricamento.");
      }
      setSrcImage(null);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il caricamento.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Foto attuale */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="font-bold text-ink mb-4">Foto attuale</h2>
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt="Foto bambino"
            className="w-40 h-40 rounded-full object-cover border-2 border-line"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-sky-500 flex items-center justify-center border-2 border-line">
            <span className="text-white font-bold text-4xl">{initials}</span>
          </div>
        )}
      </section>

      {/* Upload + crop */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-5">
        <h2 className="font-bold text-ink">{fotoUrl ? "Sostituisci foto" : "Carica foto"}</h2>

        {error && (
          <div className="bg-flag-50 border border-flag-200 rounded-[var(--radius-md)] px-4 py-2 text-flag-700 text-sm">
            {error}
          </div>
        )}

        {!srcImage ? (
          <DropZoneFile
            accept="image/jpeg,image/png"
            maxSize={5 * 1024 * 1024}
            onFile={handleDropFile}
            helper="JPG o PNG — max 5MB"
          />
        ) : (
          <div className="space-y-4">
            {/* Crop area */}
            <div className="relative w-full h-72 bg-bg-muted rounded-[var(--radius-lg)] overflow-hidden">
              <Cropper
                image={srcImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-navy-700"
            />
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleUpload}
                loading={uploading}
              >
                Carica foto
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setSrcImage(null)}
                disabled={uploading}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-ink-muted">
          Una foto recente di tuo figlio. La usiamo per riconoscerlo durante lezioni e gare. JPG/PNG, max 5MB.
        </p>
      </section>
    </div>
  );
}
