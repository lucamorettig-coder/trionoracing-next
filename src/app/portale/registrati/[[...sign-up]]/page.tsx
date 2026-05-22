import { SignUp } from "@clerk/nextjs";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";

export default function RegistratiPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-soft p-6">
      <SignUp
        appearance={trionoClerkAppearance}
        fallbackRedirectUrl="/portale"
        signInUrl="/portale/login"
      />
    </main>
  );
}
