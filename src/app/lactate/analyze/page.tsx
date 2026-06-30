import { TopBar } from "@/components/TopBar";

import { ManualAnalyzer } from "./ManualAnalyzer";

export const metadata = {
  title: "Lactate threshold calculator",
};

export default function AnalyzePage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Threshold calculator"
        subtitle="Enter stages → LT1 / LT2"
        backHref="/lactate"
      />
      <main className="flex-1 px-5 py-4 pb-10 md:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <ManualAnalyzer />
        </div>
      </main>
    </div>
  );
}
