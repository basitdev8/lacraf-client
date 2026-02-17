"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { StepIndicator } from "@/components/step-indicator";

interface KycStepProps {
  onComplete: () => void;
  onBack: () => void;
}

interface DocField {
  key: string;
  label: string;
  desc: string;
  required: boolean;
}

const DOCUMENTS: DocField[] = [
  {
    key: "aadhaar-front",
    label: "Aadhaar Card (Front)",
    desc: "Front side in clear quality",
    required: true,
  },
  {
    key: "aadhaar-back",
    label: "Aadhaar Card (Back)",
    desc: "Back side in clear quality",
    required: true,
  },
  {
    key: "pan",
    label: "PAN Card",
    desc: "Clear image of your PAN card",
    required: true,
  },
  {
    key: "bank-proof",
    label: "Bank Proof",
    desc: "Passbook or cancelled cheque",
    required: true,
  },
  {
    key: "business-cert",
    label: "Business Certificate",
    desc: "If applicable",
    required: false,
  },
  {
    key: "gst",
    label: "GST Certificate",
    desc: "If applicable",
    required: false,
  },
];

export function KycStep({ onComplete, onBack }: KycStepProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const requiredDocs = DOCUMENTS.filter((d) => d.required);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.key]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequiredUploaded) {
      setError("Please upload all required documents");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      for (const [key, file] of Object.entries(files)) {
        if (file) formData.append(key, file);
      }

      await api.post("/kyc/upload", formData);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <StepIndicator currentStep="kyc" />

        <div className="text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Upload Documents
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Share your identity and business documents for verification.
            We review within 72 hours. All documents are kept secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10">
          {/* Required docs */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
              Required Documents
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOCUMENTS.filter((d) => d.required).map((doc) => {
                const file = files[doc.key];
                return (
                  <label
                    key={doc.key}
                    className={`group flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:border-foreground/30 ${
                      file
                        ? "border-foreground/20 bg-[#fafafa]"
                        : "border-border"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        file
                          ? "bg-foreground text-white"
                          : "bg-[#f5f5f5] text-muted group-hover:bg-[#ebebeb]"
                      }`}
                    >
                      {file ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{doc.label}</p>
                      <p className="truncate text-xs text-muted">
                        {file ? file.name : doc.desc}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(doc.key, e.target.files?.[0] || null)
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional docs */}
          <div className="mt-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
              Optional Documents
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOCUMENTS.filter((d) => !d.required).map((doc) => {
                const file = files[doc.key];
                return (
                  <label
                    key={doc.key}
                    className={`group flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:border-foreground/30 ${
                      file
                        ? "border-foreground/20 bg-[#fafafa]"
                        : "border-border border-dashed"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        file
                          ? "bg-foreground text-white"
                          : "bg-[#f5f5f5] text-muted group-hover:bg-[#ebebeb]"
                      }`}
                    >
                      {file ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{doc.label}</p>
                      <p className="truncate text-xs text-muted">
                        {file ? file.name : doc.desc}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(doc.key, e.target.files?.[0] || null)
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Accepted formats: JPG, PNG, WEBP, PDF
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <button type="button" onClick={onBack} className="btn-outline">
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !allRequiredUploaded}
              className="btn-dark"
            >
              {loading ? "Uploading..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
