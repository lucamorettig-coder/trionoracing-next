"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DropState = "idle" | "dragover" | "uploading" | "success" | "error";

interface Props {
  accept?: string;
  maxSize?: number;
  onFile: (file: File) => void | Promise<void>;
  label?: string;
  helper?: string;
  disabled?: boolean;
}

export default function DropZoneFile({ accept, maxSize, onFile, label, helper, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DropState>("idle");
  const [preview, setPreview] = useState<{ name: string; type: string; url?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setErrorMsg(null);
      if (maxSize && file.size > maxSize) {
        setErrorMsg(`Il file è troppo grande. Max ${Math.round(maxSize / 1024 / 1024)}MB.`);
        return;
      }
      const isImage = file.type.startsWith("image/");
      const url = isImage ? URL.createObjectURL(file) : undefined;
      setPreview({ name: file.name, type: file.type, url });
      setState("uploading");
      try {
        await onFile(file);
        setState("success");
      } catch (err) {
        setState("error");
        setErrorMsg(err instanceof Error ? err.message : "Errore durante il caricamento.");
      }
    },
    [maxSize, onFile],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function reset() {
    setPreview(null);
    setState("idle");
    setErrorMsg(null);
  }

  const isUploading = state === "uploading";

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-ink">{label}</p>}

      {preview ? (
        <div className="relative flex items-center gap-3 border border-line rounded-[var(--radius-lg)] p-3 bg-bg-soft">
          {preview.url ? (
            <img src={preview.url} alt="Preview" className="w-12 h-12 rounded object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded bg-navy-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-navy-700" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{preview.name}</p>
            <p className="text-xs text-ink-muted capitalize">
              {state === "uploading" ? "Caricamento in corso…" : state === "success" ? "Caricato" : state === "error" ? "Errore" : "Pronto"}
            </p>
          </div>
          {!isUploading && (
            <button onClick={reset} className="text-ink-muted hover:text-ink shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="shrink-0 w-4 h-4 border-2 border-navy-700 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setState("dragover"); }}
          onDragLeave={() => setState("idle")}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-8 rounded-[var(--radius-lg)] border-2 border-dashed cursor-pointer transition-colors",
            state === "dragover"
              ? "border-navy-700 bg-navy-50"
              : "border-line hover:border-navy-300 hover:bg-bg-soft",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center">
            {accept?.includes("image") ? (
              <Image className="w-5 h-5 text-navy-700" />
            ) : (
              <Upload className="w-5 h-5 text-navy-700" />
            )}
          </div>
          <p className="text-sm font-semibold text-ink text-center">
            Trascina qui il file o <span className="text-navy-700 underline">sfoglia</span>
          </p>
          {maxSize && (
            <p className="text-xs text-ink-muted">Max {Math.round(maxSize / 1024 / 1024)}MB</p>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-flag-500">{errorMsg}</p>
      )}
      {helper && !errorMsg && (
        <p className="text-xs text-ink-muted">{helper}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  );
}
