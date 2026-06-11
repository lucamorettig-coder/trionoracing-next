import type { Appearance } from "@clerk/types";

/**
 * trionoClerkAppearance — Triono Racing
 *
 * Da passare a <SignIn appearance={trionoClerkAppearance} />,
 * <SignUp appearance={...} /> e <UserButton appearance={...} />
 *
 * I valori sono allineati al design system: navy-700 primario,
 * radius 16/12, font Inter, ombre brand.
 */
export const trionoClerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1F2D5A",          // navy-700
    colorBackground: "#FFFFFF",
    colorText: "#14193A",             // ink
    colorTextSecondary: "#6B7388",    // ink-muted
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14193A",
    colorDanger: "#C01818",           // flag-500
    colorSuccess: "#5FAC36",          // grass-500
    colorWarning: "#E09618",          // ember-500
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    borderRadius: "16px",             // radius-lg
    spacingUnit: "4px",
  },
  elements: {
    rootBox: "w-full",
    card:
      "shadow-[0_20px_40px_rgba(20,25,58,0.10),0_4px_12px_rgba(20,25,58,0.05)] " +
      "border border-line rounded-[20px] bg-white p-8",
    logoBox: "mb-6",
    headerTitle: "text-[28px] font-bold tracking-tight text-ink",
    headerSubtitle: "text-ink-muted text-sm",

    /* Social buttons */
    socialButtonsBlockButton:
      "rounded-[12px] border-line h-12 normal-case font-semibold " +
      "hover:bg-bg-muted transition-colors",
    socialButtonsBlockButtonText: "text-[14px]",

    /* Divider */
    dividerLine: "bg-line",
    dividerText: "text-ink-muted text-xs",

    /* Form */
    formFieldLabel: "text-[13px] font-semibold text-ink mb-1.5",
    formFieldInput:
      "rounded-[12px] border-[1.5px] border-line h-12 px-3.5 text-[15px] " +
      "focus:border-navy-700 focus:ring-4 focus:ring-navy-700/15 transition-[border-color,box-shadow]",
    formFieldInputShowPasswordButton: "text-ink-muted hover:text-navy-700",
    formFieldErrorText: "text-flag-500 text-xs mt-1.5",

    /* Primary CTA */
    formButtonPrimary:
      "bg-navy-700 hover:bg-navy-900 rounded-[16px] h-12 px-5 " +
      "text-[15px] font-semibold normal-case text-white " +
      "shadow-[0_2px_6px_rgba(20,25,58,0.06)] transition-colors",

    /* Footer links (Sign up / Forgot password) */
    footer: "mt-5",
    footerActionLink: "text-sky-600 hover:text-navy-700 font-semibold",
    footerActionText: "text-ink-muted text-sm",

    /* UserButton */
    avatarBox: "rounded-full ring-2 ring-white",
    userButtonPopoverCard:
      "rounded-[20px] shadow-[0_20px_40px_rgba(20,25,58,0.10),0_4px_12px_rgba(20,25,58,0.05)] " +
      "border border-line",
    userButtonPopoverActionButton: "rounded-[12px] hover:bg-bg-muted",
    userButtonPopoverActionButtonText: "text-ink",
    userButtonPopoverFooter: "border-t border-line",

    /* Identity preview (Sign-in step 2) */
    identityPreview: "rounded-[12px] border border-line bg-bg-soft",
    identityPreviewEditButton: "text-sky-600",

    /* OTP */
    otpCodeFieldInput:
      "rounded-[12px] border-[1.5px] border-line focus:border-navy-700 " +
      "focus:ring-4 focus:ring-navy-700/15",
  },
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
  },
};
