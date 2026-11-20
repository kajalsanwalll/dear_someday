
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import {
  getDiaryEntry,
  saveDiaryEntry,
  type DiaryEntry,
} from "@/lib/diary";

const STORAGE_KEY = "dear-someday-diary";

type MigrationStatus = {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
};

export default function DiaryMigrationPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const [status, setStatus] = useState<MigrationStatus>({
    total: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      setEntries(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMessage("Couldn't read your old diary data.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function startMigration() {
    if (!entries.length || migrating) return;

    setMigrating(true);
    setCompleted(false);
    setErrors([]);
    setCurrent(0);

    const result: MigrationStatus = {
      total: entries.length,
      imported: 0,
      skipped: 0,
      failed: 0,
    };

    setStatus(result);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      setCurrent(i + 1);
      setMessage(`Preserving ${entry.date}...`);

      try {
        // Prevent overwriting existing Supabase entries.
        const existing = await getDiaryEntry(entry.date);

        if (existing) {
          result.skipped++;
        } else {
          await saveDiaryEntry({
            ...entry,
            photos: entry.photos || [],
            savedAt: entry.savedAt || new Date().toISOString(),
          });

          result.imported++;
        }
      }  catch (error: any) {
  result.failed++;

  const details =
    error?.message ||
    error?.details ||
    error?.hint ||
    error?.code ||
    JSON.stringify(error) ||
    String(error);

  console.error("Diary migration error:", entry.date, error);

  setErrors((previous) => [
    ...previous,
    `${entry.date}: ${details}`,
  ]);
}

      setStatus({ ...result });
    }

    setMigrating(false);
    setCompleted(true);
    setMessage("Your memories have been taken care of ♡");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-12 md:py-16">
      <Link
        href="/diary"
        className="mb-10 inline-flex items-center gap-2 text-sm text-[#958477] transition hover:text-[#493C38]"
      >
        <ArrowLeft size={16} />
        Back to my diary
      </Link>

      <p className="font-handwriting text-2xl text-[#C7A6A3]">
        keeping every little memory
      </p>

      <h1 className="mt-3 font-heading text-4xl text-[#493C38] md:text-5xl">
        Bring my memories home
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-7 text-[#958477]">
        Your diary entries have been living in this browser.
        We're gently moving them into your private cloud diary
        so they're safe and available wherever you sign in.
      </p>

      <div className="mt-10 rounded-sm border border-[#e8dfd4] bg-[#FFFCF8] p-6 shadow-sm md:p-8">
        {loading ? (
          <p className="text-sm text-[#958477]">
            Looking for your old memories...
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-[#C7A6A3]" />

              <div>
                <p className="text-lg text-[#493C38]">
                  {entries.length} diary {entries.length === 1 ? "entry" : "entries"} found
                </p>

                <p className="mt-1 text-xs text-[#958477]">
                  Your original browser copy will remain untouched.
                </p>
              </div>
            </div>

            {entries.length === 0 && (
              <p className="mt-6 text-sm text-[#958477]">
                No old diary entries were found in this browser.
              </p>
            )}

            {entries.length > 0 && (
              <div className="mt-6 space-y-2 border-t border-[#e8dfd4] pt-5">
                <p className="text-sm text-[#958477]">
                  Entries from {entries[entries.length - 1]?.date} to{" "}
                  {entries[0]?.date}
                </p>

                <p className="text-sm text-[#958477]">
                  Photos included:{" "}
                  {entries.reduce(
                    (total, entry) => total + (entry.photos?.length || 0),
                    0
                  )}
                </p>
              </div>
            )}

            {migrating && (
              <div className="mt-8">
                <div className="mb-2 flex justify-between text-xs text-[#958477]">
                  <span>{message}</span>
                  <span>
                    {current}/{status.total}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#eee5db]">
                  <div
                    className="h-full rounded-full bg-[#C7A6A3] transition-all duration-300"
                    style={{
                      width: `${(current / status.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {completed && (
              <div className="mt-8 rounded-xl bg-[#f5f0e8] p-5">
                <CheckCircle2
                  size={22}
                  className="text-[#8f9a7c]"
                />

                <p className="mt-3 font-heading text-xl text-[#493C38]">
                  Migration finished ♡
                </p>

                <div className="mt-4 space-y-1 text-sm text-[#958477]">
                  <p>Successfully imported: {status.imported}</p>
                  <p>Already existed (skipped): {status.skipped}</p>
                  <p>Failed: {status.failed}</p>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  A few entries couldn't be imported:
                </p>

                <ul className="mt-2 space-y-1 text-xs text-red-600">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && !completed && !migrating && (
              <p className="mt-5 text-sm text-[#958477]">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={startMigration}
              disabled={loading || migrating || entries.length === 0}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#493C38] px-6 py-3 text-sm text-[#FFFCF8] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />

              {migrating
                ? "Preserving your memories..."
                : completed
                ? "Retry failed entries"
                : "Move my diary to Supabase"}
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-center font-handwriting text-xl text-[#C7A6A3]">
        nothing precious left behind ♡
      </p>
    </main>
  );
}
