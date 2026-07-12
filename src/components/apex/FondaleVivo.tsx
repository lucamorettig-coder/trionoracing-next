"use client";

import { useEffect, useRef, useState } from "react";

type FondaleVivoProps = {
  /** URL video ambient (10–20s loop, mai audio). Assente → solo fondale statico. */
  src?: string;
  poster?: string;
  className?: string;
};

/**
 * APEX DS v2 — FondaleVivo (L−2): il secondo stato del fondale.
 * Incapsula TUTTE le regole del §6.7/§7 DS:
 * - trattamento obbligatorio: grayscale + tinta accent (~15%, layer duotone)
 *   + vignetta navy + opacity ≤ .4 + scale(1.05) — mai video "nudo";
 * - lazy: il <video> si monta solo quando la sezione entra in viewport;
 * - pausa su tab nascosta (visibilitychange);
 * - prefers-reduced-motion / save-data → solo poster (il token --video-opacity
 *   va a 0 via CSS; qui evitiamo anche il download del video);
 * - max 1 per viewport (responsabilità del compositore di pagina).
 * Il fondale statico (stage + floodlight + grain) è sempre il fallback.
 */
export function FondaleVivo({ src, poster, className = "" }: FondaleVivoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Lazy-mount al viewport, con opt-out per reduced-motion / save-data
  useEffect(() => {
    if (!src) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // Pausa quando il tab è nascosto
  useEffect(() => {
    if (!showVideo) return;
    const onVis = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [showVideo]);

  return (
    <div ref={rootRef} className={`apex-fondale ${className}`.trim()} aria-hidden="true">
      {/* Poster sempre presente sotto il video (fallback + primo paint) */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element -- layer decorativo full-bleed, niente ottimizzazione next/image su fondale
        <img
          src={poster}
          alt=""
          className="apex-fondale__video"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
      )}
      {showVideo && src && (
        <video
          ref={videoRef}
          className="apex-fondale__video"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <div className="apex-fondale__duotone" />
    </div>
  );
}
