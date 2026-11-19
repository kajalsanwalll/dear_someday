
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookHeart, Plus } from "lucide-react";

type DiaryEntry = {
  date: string;
  title: string;
  manifestation: string;
  gratitude: string;
  feelings: string;
  savedAt: string;
};

const STORAGE_KEY = "dear-someday-diary";

export default function DiaryArchive() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setEntries(stored ? JSON.parse(stored) : []);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 md:py-14">
      <p className="handwritten text-2xl text-[#a18787]">
        little pieces of me
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl md:text-6xl">My diary</h1>
          <p className="mt-3 text-sm text-muted">
            A collection of thoughts, dreams and days.
          </p>
        </div>

        <Link
          href="/diary/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper transition hover:opacity-80"
        >
          <Plus size={16} />
          Write today
        </Link>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed border-[#493c38]/20 bg-[#fffcf8]/60 px-6 py-16 text-center">
          <BookHeart
            size={30}
            strokeWidth={1}
            className="mx-auto text-muted"
          />

          <h2 className="mt-5 text-2xl">
            Your story starts here.
          </h2>

          <p className="handwritten mt-3 text-xl text-muted">
            One page, one dream, one little moment at a time.
          </p>

          <Link
            href="/diary/new"
            className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4"
          >
            Write your first entry
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Entries */}
      {entries.length > 0 && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.date}
              href={`/diary/new?date=${entry.date}`}
              className="group bg-[#fffcf8] p-6 shadow-[0_4px_20px_rgba(73,60,56,0.04)] transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-widest text-muted">
                {new Date(`${entry.date}T12:00:00`).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>

              <h2 className="mt-4 text-2xl">
                {entry.title || "A little entry"}
              </h2>

              <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted">
                {entry.manifestation || "A page of thoughts..."}
              </p>

              <p className="handwritten mt-5 text-lg text-[#987f83]">
                read again ♡
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
