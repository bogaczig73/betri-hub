import { TopBar } from "@/components/TopBar";

import { NewTestForm } from "./NewTestForm";

export default function NewTestPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="New test" backHref="/lactate" />
      <main className="flex-1 px-5 py-5 md:px-8">
        <div className="mx-auto w-full max-w-xl">
          <NewTestForm />
        </div>
      </main>
    </div>
  );
}
