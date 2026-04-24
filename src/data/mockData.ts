// PERSON A — fill this out with 3 patient profiles, 5 years of data
// Shape must match LabReport[] from src/types/lab.ts

import type { LabReport } from '../types/lab';

export const MOCK_REPORTS: LabReport[] = [
  {
    id: 'report-2019-annual',
    patient_name: 'Demo Patient',
    date: '2019-03-10',
    results: [
      { test_name: 'Total Cholesterol', value: 185, unit: 'mg/dL', reference_range: { low: 0, high: 200 }, date: '2019-03-10' },
      { test_name: 'LDL Cholesterol',   value: 110, unit: 'mg/dL', reference_range: { low: 0, high: 130 }, date: '2019-03-10' },
      { test_name: 'HDL Cholesterol',   value: 52,  unit: 'mg/dL', reference_range: { low: 40, high: 999 }, date: '2019-03-10' },
      { test_name: 'Triglycerides',     value: 115, unit: 'mg/dL', reference_range: { low: 0, high: 150 }, date: '2019-03-10' },
      { test_name: 'HbA1c',            value: 5.4, unit: '%',     reference_range: { low: 0, high: 5.7 }, date: '2019-03-10' },
      { test_name: 'Vitamin D',         value: 32,  unit: 'ng/mL', reference_range: { low: 30, high: 100 }, date: '2019-03-10' },
      { test_name: 'TSH',              value: 1.8, unit: 'mIU/L', reference_range: { low: 0.4, high: 4.0 }, date: '2019-03-10' },
    ],
  },
  {
    id: 'report-2020-annual',
    patient_name: 'Demo Patient',
    date: '2020-04-02',
    results: [
      { test_name: 'Total Cholesterol', value: 198, unit: 'mg/dL', reference_range: { low: 0, high: 200 }, date: '2020-04-02' },
      { test_name: 'LDL Cholesterol',   value: 122, unit: 'mg/dL', reference_range: { low: 0, high: 130 }, date: '2020-04-02' },
      { test_name: 'HDL Cholesterol',   value: 49,  unit: 'mg/dL', reference_range: { low: 40, high: 999 }, date: '2020-04-02' },
      { test_name: 'Triglycerides',     value: 135, unit: 'mg/dL', reference_range: { low: 0, high: 150 }, date: '2020-04-02' },
      { test_name: 'HbA1c',            value: 5.6, unit: '%',     reference_range: { low: 0, high: 5.7 }, date: '2020-04-02' },
      { test_name: 'Vitamin D',         value: 24,  unit: 'ng/mL', reference_range: { low: 30, high: 100 }, date: '2020-04-02' },
      { test_name: 'TSH',              value: 2.1, unit: 'mIU/L', reference_range: { low: 0.4, high: 4.0 }, date: '2020-04-02' },
    ],
  },
  {
    id: 'report-2021-annual',
    patient_name: 'Demo Patient',
    date: '2021-02-18',
    results: [
      { test_name: 'Total Cholesterol', value: 211, unit: 'mg/dL', reference_range: { low: 0, high: 200 }, date: '2021-02-18' },
      { test_name: 'LDL Cholesterol',   value: 135, unit: 'mg/dL', reference_range: { low: 0, high: 130 }, date: '2021-02-18' },
      { test_name: 'HDL Cholesterol',   value: 47,  unit: 'mg/dL', reference_range: { low: 40, high: 999 }, date: '2021-02-18' },
      { test_name: 'Triglycerides',     value: 145, unit: 'mg/dL', reference_range: { low: 0, high: 150 }, date: '2021-02-18' },
      { test_name: 'HbA1c',            value: 5.8, unit: '%',     reference_range: { low: 0, high: 5.7 }, date: '2021-02-18' },
      { test_name: 'Vitamin D',         value: 19,  unit: 'ng/mL', reference_range: { low: 30, high: 100 }, date: '2021-02-18' },
      { test_name: 'TSH',              value: 2.4, unit: 'mIU/L', reference_range: { low: 0.4, high: 4.0 }, date: '2021-02-18' },
    ],
  },
  {
    id: 'report-2022-annual',
    patient_name: 'Demo Patient',
    date: '2022-05-07',
    results: [
      { test_name: 'Total Cholesterol', value: 223, unit: 'mg/dL', reference_range: { low: 0, high: 200 }, date: '2022-05-07' },
      { test_name: 'LDL Cholesterol',   value: 148, unit: 'mg/dL', reference_range: { low: 0, high: 130 }, date: '2022-05-07' },
      { test_name: 'HDL Cholesterol',   value: 44,  unit: 'mg/dL', reference_range: { low: 40, high: 999 }, date: '2022-05-07' },
      { test_name: 'Triglycerides',     value: 155, unit: 'mg/dL', reference_range: { low: 0, high: 150 }, date: '2022-05-07' },
      { test_name: 'HbA1c',            value: 6.0, unit: '%',     reference_range: { low: 0, high: 5.7 }, date: '2022-05-07' },
      { test_name: 'Vitamin D',         value: 17,  unit: 'ng/mL', reference_range: { low: 30, high: 100 }, date: '2022-05-07' },
      { test_name: 'TSH',              value: 2.8, unit: 'mIU/L', reference_range: { low: 0.4, high: 4.0 }, date: '2022-05-07' },
    ],
  },
  {
    id: 'report-2023-annual',
    patient_name: 'Demo Patient',
    date: '2023-06-14',
    results: [
      { test_name: 'Total Cholesterol', value: 238, unit: 'mg/dL', reference_range: { low: 0, high: 200 }, date: '2023-06-14' },
      { test_name: 'LDL Cholesterol',   value: 162, unit: 'mg/dL', reference_range: { low: 0, high: 130 }, date: '2023-06-14' },
      { test_name: 'HDL Cholesterol',   value: 41,  unit: 'mg/dL', reference_range: { low: 40, high: 999 }, date: '2023-06-14' },
      { test_name: 'Triglycerides',     value: 175, unit: 'mg/dL', reference_range: { low: 0, high: 150 }, date: '2023-06-14' },
      { test_name: 'HbA1c',            value: 6.2, unit: '%',     reference_range: { low: 0, high: 5.7 }, date: '2023-06-14' },
      { test_name: 'Vitamin D',         value: 15,  unit: 'ng/mL', reference_range: { low: 30, high: 100 }, date: '2023-06-14' },
      { test_name: 'TSH',              value: 3.1, unit: 'mIU/L', reference_range: { low: 0.4, high: 4.0 }, date: '2023-06-14' },
    ],
  },
];
