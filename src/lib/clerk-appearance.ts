import type { Appearance } from "@clerk/types";

/**
 * trionoClerkAppearance — Triono Racing (EVO-023)
 *
 * Appearance dei componenti Clerk (<SignIn>, <SignUp>, <UserButton>, <UserProfile>).
 *
 * Contesto auth split-screen (EVO-023): le pagine login/registrati montano il
 * componente Clerk dentro l'area form di <AuthSplitLayout>. Il pannello brand fa
 * da contenitore, quindi la card Clerk è resa "nuda" (no bordo/ombra/padding) e
 * l'header Clerk è nascosto (renderizziamo <AuthHeading> con il copy del mockup).
 *
 * Valori allineati al design system: navy-700 primario, sky-600 link, radius 12/16,
 * font Inter/JetBrains Mono, social in basso (placement "bottom" come da mockup).
 */
export const trionoClerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1F2D5A", // navy-700
    colorBackground: "#FFFFFF",
    colorText: "#14193A", // ink
    colorTextSecondary: "#6B7388", // ink-muted
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14193A",
    colorDanger: "#C01818", // flag-500
    colorSuccess: "#5FAC36", // grass-500
    colorWarning: "#E09618", // ember-500
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    borderRadius: "12px", // radius-md (campi/social); il CTA usa radius-lg via class
    spacingUnit: "4px",
  },
  elements: {
    rootBox: "w-full",

    /* Card "nuda": il contenitore visivo è il pannello dello split-screen */
    cardBox: "w-full shadow-none border-0 bg-transparent",
    card: "w-full shadow-none border-0 bg-transparent p-0 gap-5",

    /* Header Clerk nascosto — usiamo <AuthHeading> con il copy del mockup */
    header: "hidden",
    logoBox: "hidden",

    /* Corpo form */
    main: "gap-4",

    /* Social (Google) — placement "bottom", stile mockup btn-social */
    socialButtonsBlockButton:
      "h-12 rounded-[12px] border-[1.5px] border-line bg-white normal-case font-medium " +
      "text-[14.5px] text-ink hover:bg-bg-soft hover:border-navy-200 transition-colors",
    socialButtonsBlockButtonText: "text-[14.5px] font-medium",
    socialButtonsProviderIcon: "w-[18px] h-[18px]",

    /* Divider "oppure" */
    dividerRow: "my-2",
    dividerLine: "bg-line",
    dividerText:
      "font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted",

    /* Campi */
    formFieldLabel: "text-[13px] font-semibold text-ink mb-1.5",
    formFieldInput:
      "rounded-[12px] border-[1.5px] border-line h-12 px-3.5 text-[15px] " +
      "focus:border-navy-700 focus:ring-4 focus:ring-navy-700/15 transition-[border-color,box-shadow]",
    formFieldInputShowPasswordButton: "text-ink-muted hover:text-navy-700",
    formFieldErrorText: "text-flag-500 text-xs mt-1.5",
    formFieldSuccessText: "text-grass-700 text-xs mt-1.5",
    formFieldHintText: "text-ink-muted text-xs mt-1.5",
    formFieldAction: "text-sky-600 hover:text-navy-700 font-semibold text-[12.5px]",
    /* Nascondi il link reset inline di <SignIn>: il recupero usa la pagina
       custom /portale/recupero-password (scelta utente EVO-023). */
    formFieldAction__forgotPassword: "hidden",

    /* CTA primaria — navy-700, radius-lg, full width */
    formButtonPrimary:
      "bg-navy-700 hover:bg-navy-900 rounded-[16px] h-12 px-5 " +
      "text-[15px] font-semibold normal-case text-white " +
      "shadow-[0_2px_6px_rgba(20,25,58,0.06)] transition-colors",

    /* Metodi alternativi / back (sign-in step 2) */
    alternativeMethodsBlockButton:
      "rounded-[12px] border-[1.5px] border-line h-12 hover:bg-bg-soft",
    backLink: "text-sky-600 hover:text-navy-700 font-semibold",

    /* Footer (Registrati / Accedi) */
    footer: "mt-5",
    footerAction: "justify-center",
    footerActionText: "text-ink-muted text-sm",
    footerActionLink: "text-navy-700 hover:text-sky-600 font-semibold",

    /* Identity preview (sign-in step 2) */
    identityPreview: "rounded-[12px] border border-line bg-bg-soft",
    identityPreviewEditButton: "text-sky-600",

    /* OTP (verifica email registrazione) */
    otpCodeFieldInput:
      "rounded-[12px] border-[1.5px] border-line focus:border-navy-700 " +
      "focus:ring-4 focus:ring-navy-700/15",
    formResendCodeLink: "text-sky-600 hover:text-navy-700 font-semibold",

    /* UserButton / UserProfile (usati altrove nel portale) */
    avatarBox: "rounded-full ring-2 ring-white",
    userButtonPopoverCard:
      "rounded-[20px] shadow-[0_20px_40px_rgba(20,25,58,0.10),0_4px_12px_rgba(20,25,58,0.05)] " +
      "border border-line",
    userButtonPopoverActionButton: "rounded-[12px] hover:bg-bg-muted",
    userButtonPopoverActionButtonText: "text-ink",
    userButtonPopoverFooter: "border-t border-line",
  },
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
  },
};
