import type { PatientData } from "../types";

export type ChartsPanelProps = {
  patient: PatientData;
};

export function ChartsPanel({ patient }: ChartsPanelProps) {
  return (
    <section className="w-full max-w-4xl rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <pre className="max-h-[32rem] overflow-auto text-xs leading-5 text-slate-200">
        {JSON.stringify(patient, null, 2)}
      </pre>
    </section>
  );
}
