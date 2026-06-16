import { BetriMark, Wordmark } from "@/components/Brand";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <BetriMark size={64} className="mb-5 rounded-3xl" />
        <Wordmark className="text-3xl" />
        <p className="mt-2 text-muted-foreground">
          Apps for the Betri triathlon group
        </p>
      </div>
      <LoginForm from={from ?? "/"} />
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Ask a coach for the group passcode.
      </p>
    </main>
  );
}
