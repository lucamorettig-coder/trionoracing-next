import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  /** Il pannello brand (tipicamente <AuthBrandPanel />). */
  brand: ReactNode;
  /** Il contenuto dell'area form (heading custom + componente Clerk). */
  children: ReactNode;
};

/**
 * AuthSplitLayout — Triono Racing (EVO-023)
 *
 * Split-screen delle pagine auth: brand panel + area form.
 * Mobile: impilato (brand header in alto, form sotto a piena larghezza).
 * Desktop (lg): affiancati (brand ~1.1fr a sinistra, form 1fr a destra, full-height).
 */
export function AuthSplitLayout({ brand, children }: AuthSplitLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-bg lg:flex-row">
      {brand}
      <div className="flex flex-1 flex-col justify-center bg-bg px-5 py-9 lg:px-16 lg:py-14">
        <div className="mx-auto w-full max-w-[440px]">{children}</div>
      </div>
    </main>
  );
}
