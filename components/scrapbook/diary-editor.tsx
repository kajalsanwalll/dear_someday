
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Heart,
  Sparkles,
  ImagePlus,
  X,
} from "lucide-react";

import {
  getDiaryEntry,
  saveDiaryEntry,
  type DiaryEntry,
  type DiaryPhoto,
} from "@/lib/diary";

// Get today's date in YYYY-MM-DD format
function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Format selected date
function getFormattedDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

// Compress photos before uploading
async function compressImage(file: File): Promise<string> {
  const image = await createImageBitmap(file);

  try {
    const maxSize = 1200;

    const scale = Math.min(
      1,
      maxSize / Math.max(image.width, image.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not process image.");
    }

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    image.close();
  }
}

export default function DiaryEditor({
  initialDate,
}: {
  initialDate?: string;
}) {
  const [date, setDate] = useState(initialDate || "");

  const [title, setTitle] = useState("");
  const [manifestation, setManifestation] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [feelings, setFeelings] = useState("");
  const [photos, setPhotos] = useState<DiaryPhoto[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const loadVersion = useRef(0);
  const saving = useRef(false);
  const pendingSave = useRef(false);
  const saveEntryRef = useRef<() => Promise<void>>(async () => {});

  // Initialize date
  useEffect(() => {
    if (!initialDate) {
      setDate(getToday());
    }
  }, [initialDate]);

  // Load diary entry from Supabase
  useEffect(() => {
    if (!date) return;

    const version = ++loadVersion.current;
    let cancelled = false;

    setLoaded(false);
    setLoading(true);
    setSaveStatus("");

    async function loadEntry() {
      try {
        const entry = await getDiaryEntry(date);

        if (cancelled || version !== loadVersion.current) {
          return;
        }

        setTitle(entry?.title || "");
        setManifestation(entry?.manifestation || "");
        setGratitude(entry?.gratitude || "");
        setFeelings(entry?.feelings || "");
        setPhotos(entry?.photos || []);

        setLoaded(true);
      } catch (error) {
        console.error("Diary loading error:", error);

        if (!cancelled && version === loadVersion.current) {
          setSaveStatus(
            error instanceof Error
              ? error.message
              : "Couldn't load your diary entry."
          );
        }
      } finally {
        if (!cancelled && version === loadVersion.current) {
          setLoading(false);
        }
      }
    }

    loadEntry();

    return () => {
      cancelled = true;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [date]);

  // Save diary entry to Supabase
  const saveEntry = useCallback(async () => {
    if (!loaded || !date) return;

    if (saving.current) {
      pendingSave.current = true;
      return;
    }

    const isEmpty =
      !title.trim() &&
      !manifestation.trim() &&
      !gratitude.trim() &&
      !feelings.trim() &&
      photos.length === 0;

    if (isEmpty) {
      setSaveStatus("");
      return;
    }

    saving.current = true;
    setSaveStatus("Saving your memories ♡");

    const entry: DiaryEntry = {
      date,
      title,
      manifestation,
      gratitude,
      feelings,
      photos,
      savedAt: new Date().toISOString(),
    };

    try {
      await saveDiaryEntry(entry);
      setSaveStatus("Saved gently ♡");
    } catch (error) {
      console.error("Diary saving error:", error);

      setSaveStatus(
        error instanceof Error
          ? error.message
          : "Couldn't save your entry. Please try again ♡"
      );
    } finally {
      saving.current = false;

      if (pendingSave.current) {
        pendingSave.current = false;
        saveTimer.current = setTimeout(() => {
          void saveEntryRef.current();
        }, 300);
      }
    }
  }, [
    date,
    title,
    manifestation,
    gratitude,
    feelings,
    photos,
    loaded,
  ]);

  useEffect(() => {
    saveEntryRef.current = saveEntry;
  }, [saveEntry]);

  // Autosave when content changes
  useEffect(() => {
    if (!loaded || loading || !date) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      saveEntry();
    }, 900);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [
    title,
    manifestation,
    gratitude,
    feelings,
    photos,
    date,
    loaded,
    loading,
    saveEntry,
  ]);

  // Upload photographs
  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setSaveStatus("Tucking your photos in...");

    try {
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          src: await compressImage(file),
          caption: "",
        }))
      );

      setPhotos((previous) => [
        ...previous,
        ...uploadedPhotos,
      ]);
    } catch (error) {
      console.error("Photo upload error:", error);

      setSaveStatus("Couldn't add that photo. Try another ♡");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Update photo caption
  function updateCaption(id: string, caption: string) {
    setPhotos((previous) =>
      previous.map((photo) =>
        photo.id === id
          ? { ...photo, caption }
          : photo
      )
    );
  }

  // Remove photo from entry
  function removePhoto(id: string) {
    setPhotos((previous) =>
      previous.filter((photo) => photo.id !== id)
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-12 md:py-16">

      {/* Back button */}
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

      {/* Loading */}
      {loading && (
        <p className="mb-6 text-sm text-[#958477]">
          Opening your little memories... ♡
        </p>
      )}

      {/* Intro */}
      <div className="mb-10">
        <h1 className="font-heading text-5xl leading-tight text-[#493C38] md:text-6xl">
          Dear Universe,
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#958477]">
          Today, I want to make space for my thoughts,
          dreams, and everything my heart is holding.
        </p>
      </div>

      {/* Scrapbook paper */}
      <div
        className={`space-y-9 rounded-sm border border-[#e8dfd4] p-6 shadow-sm md:p-10 ${
          loading ? "opacity-60" : ""
        }`}
        style={{
          backgroundColor: "#FFFCF8",
          backgroundImage:
            "linear-gradient(to bottom, transparent 31px, #eee5db 32px)",
          backgroundSize: "100% 32px",
        }}
      >
        {/* Title */}
        <div>
          <label className="mb-3 block font-handwriting text-2xl text-[#C7A6A3]">
            Today&apos;s little title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!loaded}
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
            disabled={!loaded}
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
            disabled={!loaded}
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
            disabled={!loaded}
            placeholder="No judgement here. Just me, being honest..."
            rows={4}
            className="w-full resize-none bg-transparent font-body text-[15px] leading-8 text-[#493C38] outline-none placeholder:text-[#c8bdb1]"
          />
        </div>

        {/* Photos */}
        <div className="pt-2">

          <div className="mb-4 flex items-center justify-between">
            <label className="font-handwriting text-2xl text-[#C7A6A3]">
              Little pieces of today
            </label>

            <Sparkles
              size={18}
              className="text-[#C7A6A3]"
            />
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`relative bg-white p-3 pb-5 shadow-md ${
                    index % 2 === 0
                      ? "rotate-[-1deg]"
                      : "rotate-[1.5deg]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#493C38] text-white transition hover:bg-[#C7A6A3]"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>

                  <img
                    src={photo.src}
                    alt={photo.caption || "A diary memory"}
                    className="aspect-[4/5] w-full object-cover"
                  />

                  <input
                    value={photo.caption}
                    onChange={(e) =>
                      updateCaption(photo.id, e.target.value)
                    }
                    placeholder="Write a little caption..."
                    disabled={!loaded}
                    className="mt-3 w-full bg-transparent text-center font-handwriting text-xl text-[#958477] outline-none placeholder:text-[#c8bdb1]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload */}
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d9cbbd] bg-[#F5F0E8]/70 px-6 py-8 text-center transition hover:bg-[#F5F0E8] ${
              uploading || !loaded
                ? "pointer-events-none opacity-60"
                : ""
            }`}
          >
            <ImagePlus
              size={22}
              className="mb-3 text-[#C7A6A3]"
            />

            <span className="font-handwriting text-xl text-[#958477]">
              {uploading
                ? "Tucking your photos in..."
                : "Add little photographs"}
            </span>

            <span className="mt-1 text-xs text-[#b4a18f]">
              Choose a few pictures from your camera roll ♡
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading || !loaded}
            />
          </label>
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

      {/* Closing note */}
      <p className="mt-8 text-center text-xs leading-6 text-[#b4a18f]">
        This little space is yours. You can be messy,
        hopeful, honest, and everything in between.
      </p>
    </div>
  );
}
