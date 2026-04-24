/**
 * Lab reading parsed from a report. testName must be a canonical name
 * (e.g. "LDL Cholesterol", not "LDL-C").
 */
export interface LabReading {
  testName: string;
  value: number;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  date: string; // ISO format YYYY-MM-DD
  source?: string;
}

export interface PatientData {
  patientName: string;
  readings: LabReading[];
}
