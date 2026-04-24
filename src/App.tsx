import { PdfUpload } from "./components/PdfUpload";
import type { PatientData } from "./types";

function App() {
  const handleParsed = (data: PatientData) => {
    console.log("Parsed lab PDF", data);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Hackathon prototype
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Lab Trend Tracker
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">
          Upload bloodwork PDFs, extract structured lab readings with Claude,
          and visualize long-term trends across doctors and years.
        </p>
        <div className="pt-8">
          <PdfUpload onParsed={handleParsed} />
        </div>
      </section>
    </main>
  );
}

export default App;
