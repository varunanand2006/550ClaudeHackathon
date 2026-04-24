import { useState } from "react";
import { ChartsPanel } from "./components/ChartsPanel";
import { PdfUpload } from "./components/PdfUpload";
import { samplePatient } from "./mockData";
import type { LabReading, PatientData } from "./types";

export type CurrentPatientState = PatientData;

function sortReadingsByDate(a: LabReading, b: LabReading) {
  return a.date.localeCompare(b.date) || a.testName.localeCompare(b.testName);
}

function readingKey(reading: LabReading) {
  return `${reading.testName}::${reading.date}`;
}

function mergePatientData(
  currentPatient: PatientData,
  newPatient: PatientData,
): PatientData {
  if (currentPatient === samplePatient) {
    return {
      ...newPatient,
      readings: [...newPatient.readings].sort(sortReadingsByDate),
    };
  }

  const readingsByKey = new Map<string, LabReading>();

  currentPatient.readings.forEach((reading) => {
    readingsByKey.set(readingKey(reading), reading);
  });

  newPatient.readings.forEach((reading) => {
    readingsByKey.set(readingKey(reading), reading);
  });

  const newPatientName = newPatient.patientName.trim();

  return {
    patientName:
      newPatientName && newPatientName !== "Unknown"
        ? newPatient.patientName
        : currentPatient.patientName,
    readings: Array.from(readingsByKey.values()).sort(sortReadingsByDate),
  };
}

function App() {
  const [patient, setPatient] = useState<PatientData>(samplePatient);

  const handleParsed = (data: PatientData) => {
    console.log("Parsed lab PDF", data);
    setPatient((currentPatient) => mergePatientData(currentPatient, data));
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
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={() => setPatient(samplePatient)}
          >
            Reset to demo data
          </button>
        </div>
        <div className="pt-6">
          <PdfUpload onParsed={handleParsed} />
        </div>
        <div className="pt-6">
          <ChartsPanel patient={patient} />
        </div>
      </section>
    </main>
  );
}

export default App;
