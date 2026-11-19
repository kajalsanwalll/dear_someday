
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ImagePlus } from "lucide-react";

type DiaryEntry = {
  date: string;
  title: string;
  manifestation: string;
  gratitude: string;
  feelings: string;
  savedAt: string;
};

const STORAGE_KEY = "dear-someday-diary";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFormattedDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DiaryEditor() {
  const [date, setDate] = useState(getToday());
  const [title, setTitle] = useState("");
  const [manifestation, setManifestation] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [feelings, setFeelings] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(" ");

  // Load today's existing entry
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const entries: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    const existing = entries.find((entry) => entry.date === date);

    if (existing) {
      setTitle(existing.title);
      setManifestation(existing.manifestation);
      setGratitude(existing.gratitude);
      setFeelings(existing.feelings);
    } else {
      setTitle("");
      setManifestation("");
      setGratitude("");
      setFeelings("");
    }

    setLoaded(true);
  }, [date]);

  // Autosave
  useEffect(() => {
    if (!loaded) return;

    setSaveStatus("Saving...");

    const timer = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries: DiaryEntry[] = stored ? JSON.parse(stored) : [];

      const entry: DiaryEntry = {
        date,
        title,
        manifestation,
        gratitude,
        feelings,
        savedAt: new Date().toISOString(),
      };

      const index = entries.findIndex((item) => item.date === date);

      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.unshift(entry);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      setSaveStatus("Saved gently ♡");
    }, 700);

    return () => clearTimeout(timer);
  }, [date, title, manifestation, gratitude, feelings, loaded]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-12 md:py-12">
      {/* Top navigation */}
      <Link
        href="/diary"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to my diary
      </Link>

      {/* Date */}
      <div className="mt-12 text-center">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setLoaded(false);
            setDate(e.target.value);
          }}
          className="bg-transparent text-center text-xs tracking-[0.15em] text-muted outline-none"
        />

        <p className="mt-3 text-sm text-muted">
          {getFormattedDate(date)}
        </p>
      </div>

      {/* Journal paper */}
      <div className="relative mt-8 rounded-sm border border-[#493c38]/5 bg-[#fffcf8] px-6 py-10 shadow-[0_10px_40px_rgba(73,60,56,0.05)] md:px-14 md:py-14">
        {/* Decorative */}
        <div className="absolute -top-3 left-1/2 h-7 w-20 -translate-x-1/2 rotate-2 bg-[#d5c5a9]/50" />

        <div className="text-center">
          <p className="handwritten text-3xl text-[#a18787]">
            a little moment with myself
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl">
            Dear Universe,
          </h1>

          <p className="mt-3 text-sm text-muted">
            Let this page hold whatever is in your heart.
          </p>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give today a little title..."
          className="mt-12 w-full border-b border-[#493c38]/10 bg-transparent pb-3 text-xl outline-none placeholder:text-[#b7a79b] md:text-2xl"
        />

        {/* Manifestation */}
        <section className="mt-10">
          <p className="handwritten text-2xl text-[#987f83]">
            Today, I am manifesting...
          </p>

          <textarea
            value={manifestation}
            onChange={(e) => setManifestation(e.target.value)}
            placeholder="Write as if it's already yours. Let yourself dream without limits..."
            rows={8}
            className="mt-4 w-full resize-y bg-transparent text-[15px] leading-8 outline-none placeholder:text-[#b7a79b]"
          />
        </section>

        {/* Gratitude */}
        <section className="mt-8 border-t border-[#493c38]/10 pt-8">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-[#b58f94]" />

            <p className="handwritten text-2xl text-[#987f83]">
              I am grateful for...
            </p>
          </div>

          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="The little things, the big things, everything..."
            rows={4}
            className="mt-4 w-full resize-y bg-transparent text-[15px] leading-8 outline-none placeholder:text-[#b7a79b]"
          />
        </section>

        {/* Feelings */}
        <section className="mt-8 border-t border-[#493c38]/10 pt-8">
          <p className="handwritten text-2xl text-[#987f83]">
            When this becomes my reality, I will feel...
          </p>

          <textarea
            value={feelings}
            onChange={(e) => setFeelings(e.target.value)}
            placeholder="Close your eyes for a moment. Imagine it..."
            rows={4}
            className="mt-4 w-full resize-y bg-transparent text-[15px] leading-8 outline-none placeholder:text-[#b7a79b]"
          />
        </section>

        {/* Image attachment placeholder */}
        <button
          type="button"
          className="mt-8 flex items-center gap-2 border-t border-[#493c38]/10 pt-6 text-sm text-muted transition hover:text-ink"
        >
          <ImagePlus size={16} />
          Add a little picture (coming soon)
        </button>
      </div>

      {/* Save status */}
      <p className="handwritten mt-6 text-center text-xl text-muted">
        {saveStatus}
      </p>

      <p className="mt-2 text-center text-xs text-muted">
        This little page is yours alone.
      </p>
    </div>
  );
}
