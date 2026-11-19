
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

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
  if (!date) return "";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DiaryEditor({
  initialDate,
}: {
  initialDate?: string;
}) {
  const [date, setDate] = useState(initialDate || getToday());
  const [title, setTitle] = useState("");
  const [manifestation, setManifestation] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [feelings, setFeelings] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Load entry for the selected date
  useEffect(() => {
    setLoaded(false);

    const entries: DiaryEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const existing = entries.find((entry) => entry.date === date);

    if (existing) {
      setTitle(existing.title || "");
      setManifestation(existing.manifestation || "");
      setGratitude(existing.gratitude || "");
      setFeelings(existing.feelings || "");
    } else {
      setTitle("");
      setManifestation("");
      setGratitude("");
      setFeelings("");
    }

    setLoaded(true);
  }, [date]);

  // Autosave after the user stops typing
  useEffect(() => {
    if (!loaded) return;

    const timeout = setTimeout(() => {
      const isEmpty =
        !title.trim() &&
        !manifestation.trim() &&
        !gratitude.trim() &&
        !feelings.trim();

      if (isEmpty) {
        setSaveStatus("");
        return;
      }

      const entries: DiaryEntry[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const entry: DiaryEntry = {
        date,
        title,
        manifestation,
        gratitude,
        feelings,
        savedAt: new Date().toISOString(),
      };

      const existingIndex = entries.findIndex(
        (item) => item.date === date
      );

      if (existingIndex !== -1) {
        entries[existingIndex] = entry;
      } else {
        entries.unshift(entry);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

      setSaveStatus("Saved gently ♡");
    }, 700);

    return () => clearTimeout(timeout);
  }, [date, title, manifestation, gratitude, feelings, loaded]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-12 md:py-16">
      {/* Back */}
      <Link
        href="/diary"
        className="mb-10 inline-flex items-center gap-2 text-sm text-[#958477] transition hover:text-[#493C38]"
      >
        <ArrowLeft size={16} />
        Back to my diary
      </Link>

      {/* Date */}
      <div className="mb-8">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-full border border-[#e5dbcf] bg-[#FFFCF8] px-4 py-2 text-sm text-[#958477] outline-none"
        />

        <p className="mt-3 font-handwriting text-2xl text-[#C7A6A3]">
          {getFormattedDate(date)}
        </p>
      </div>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="font-heading text-5xl leading-tight text-[#493C38] md:text-6xl">
          Dear Universe,
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#958477]">
          Today, I want to make space for my thoughts,
          dreams, and everything my heart is holding.
        </p>
      </div>

      {/* Diary paper */}
      <div className="space-y-8 rounded-2xl border border-[#e8dfd4] bg-[#FFFCF8] p-6 shadow-sm md:p-10">
        {/* Title */}
        <div>
          <label className="mb-3 block font-handwriting text-2xl text-[#C7A6A3]">
            Today's little title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A day worth remembering..."
            className="w-full border-b border-[#e8dfd4] bg-transparent pb-3 font-heading text-2xl text-[#493C38] outline-none placeholder:text-[#c8bdb1]"
          />
        </div>

        {/* Manifestation */}
        <div>
          <label className="mb-3 block font-handwriting text-2xl text-[#C7A6A3]">
            What am I calling into my life?
          </label>

          <textarea
            value={manifestation}
            onChange={(e) => setManifestation(e.target.value)}
            placeholder="Write as if it is already yours... tell the universe everything."
            rows={7}
            className="w-full resize-none bg-transparent font-body text-[15px] leading-8 text-[#493C38] outline-none placeholder:text-[#c8bdb1]"
          />
        </div>

        {/* Gratitude */}
        <div>
          <label className="mb-3 block font-handwriting text-2xl text-[#C7A6A3]">
            Little things I am grateful for
          </label>

          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="The things that made today beautiful, even the smallest ones..."
            rows={4}
            className="w-full resize-none bg-transparent font-body text-[15px] leading-8 text-[#493C38] outline-none placeholder:text-[#c8bdb1]"
          />
        </div>

        {/* Feelings */}
        <div>
          <label className="mb-3 block font-handwriting text-2xl text-[#C7A6A3]">
            How my heart feels today
          </label>

          <textarea
            value={feelings}
            onChange={(e) => setFeelings(e.target.value)}
            placeholder="No judgement here. Just me, being honest..."
            rows={4}
            className="w-full resize-none bg-transparent font-body text-[15px] leading-8 text-[#493C38] outline-none placeholder:text-[#c8bdb1]"
          />
        </div>

        {/* Image placeholder */}
        <div className="rounded-xl border border-dashed border-[#d9cbbd] bg-[#F5F0E8] p-6 text-center">
          <Sparkles
            size={20}
            className="mx-auto mb-2 text-[#C7A6A3]"
          />

          <p className="font-handwriting text-xl text-[#958477]">
            A little picture of today
          </p>

          <p className="mt-1 text-xs text-[#b4a18f]">
            Photo memories coming soon ♡
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-[#b4a18f]">
          {saveStatus}
        </p>

        <p className="flex items-center gap-2 font-handwriting text-xl text-[#C7A6A3]">
          with love, always
          <Heart size={15} />
        </p>
      </div>

      <p className="mt-8 text-center text-xs leading-6 text-[#b4a18f]">
        This little space is yours. You can be messy,
        hopeful, honest, and everything in between.
      </p>
    </div>
  );
}
