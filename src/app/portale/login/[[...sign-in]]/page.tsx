import { SignIn } from "@clerk/nextjs";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-soft p-6">
      <SignIn appearance={trionoClerkAppearance} />
    </main>
  );
}
