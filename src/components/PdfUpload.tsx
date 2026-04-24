import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { parseLabPdf } from "../lib/parseLabPdf";
import type { PatientData } from "../types";

type ParseStatus = "pending" | "parsing" | "done" | "failed";

type UploadItem = {
  id: string;
  name: string;
  status: ParseStatus;
};

type PdfUploadProps = {
  onParsed: (data: PatientData) => void;
};

const statusStyles: Record<ParseStatus, string> = {
  pending: "bg-slate-700 text-slate-200",
  parsing: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30",
  done: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30",
  failed: "bg-rose-400/15 text-rose-200 ring-1 ring-rose-300/30",
};

function makeUploadId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

export function PdfUpload({ onParsed }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const updateStatus = (id: string, status: ParseStatus) => {
    setUploads((currentUploads) =>
      currentUploads.map((upload) =>
        upload.id === id ? { ...upload, status } : upload,
      ),
    );
  };

  const parseFile = async (file: File, id: string) => {
    updateStatus(id, "parsing");

    try {
      const data = await parseLabPdf(file);
      updateStatus(id, "done");
      onParsed(data);
    } catch (error) {
      console.error(`Failed to parse ${file.name}`, error);
      updateStatus(id, "failed");
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    const pdfFiles = Array.from(fileList).filter(
      (file) => file.type === "application/pdf",
    );

    const newUploads = pdfFiles.map((file) => ({
      id: makeUploadId(file),
      name: file.name,
      status: "pending" as const,
      file,
    }));

    setUploads((currentUploads) => [
      ...currentUploads,
      ...newUploads.map(({ file: _file, ...upload }) => upload),
    ]);

    newUploads.forEach(({ file, id }) => {
      void parseFile(file, id);
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  return (
    <section className="w-full max-w-4xl">
      <div
        className={`rounded-lg border border-dashed px-6 py-10 transition ${
          isDragging
            ? "border-cyan-300 bg-cyan-300/10"
            : "border-slate-600 bg-slate-900/70"
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Upload bloodwork PDFs
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Drag multiple PDF reports here, or choose files from your
              computer.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />

          <button
            type="button"
            className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={() => inputRef.current?.click()}
          >
            Choose PDFs
          </button>
        </div>
      </div>

      {uploads.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
          <ul className="divide-y divide-slate-800">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm font-medium text-slate-100">
                  {upload.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[upload.status]}`}
                >
                  {upload.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
