
"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Heart,
  Sparkles,
  Trash2,
  PenLine,
  Plus,
  Save,
  ArrowLeft,
} from "lucide-react";

import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from "@/lib/journal";

import { getDailyPrompt } from "@/lib/journal-prompts";

const moods = [
  { label: "Happy", emoji: "☀️" },
  { label: "Peaceful", emoji: "🌿" },
  { label: "Hopeful", emoji: "✨" },
  { label: "Grateful", emoji: "🤎" },
  { label: "Anxious", emoji: "🌧️" },
  { label: "Sad", emoji: "🌙" },
  { label: "Reflective", emoji: "🪞" },
  { label: "Excited", emoji: "🌷" },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [mood, setMood] = useState("");
  const [prompt, setPrompt] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [dailyPrompt, setDailyPrompt] = useState<string>("");
useEffect(() => {
  setDailyPrompt(getDailyPrompt());
  setTodayDate(new Date().toISOString());
}, []);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await getJournalEntries();
      setEntries(data);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your journal entries.");
    } finally {
      setLoading(false);
    }
  }

  function startNewEntry() {
    setSelectedId(null);
    setTitle("");
    setContent("");
    setGratitude("");
    setMood("");
    setPrompt(dailyPrompt);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editEntry(entry: JournalEntry) {
    setSelectedId(entry.id);
    setTitle(entry.title || "");
    setContent(entry.content || "");
    setGratitude(entry.gratitude || "");
    setMood(entry.mood || "");
    setPrompt(entry.prompt || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!content.trim() && !gratitude.trim() && !title.trim()) {
      setError("Write a little something before saving your entry 🤎");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const entryData = {
        title: title.trim(),
        content: content.trim(),
        gratitude: gratitude.trim(),
        mood,
        prompt,
      };

      if (selectedId) {
        const updated = await updateJournalEntry(
          selectedId,
          entryData
        );

        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === selectedId ? updated : entry
          )
        );
      } else {
        const created = await createJournalEntry(entryData);

        setEntries((prev) => [created, ...prev]);
        setSelectedId(created.id);
      }
    } catch (err) {
      console.error(err);
      setError("Your entry couldn't be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?"
    );

    if (!confirmed) return;

    try {
      await deleteJournalEntry(id);

      setEntries((prev) =>
        prev.filter((entry) => entry.id !== id)
      );

      if (selectedId === id) {
        startNewEntry();
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this entry.");
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] px-5 py-8 text-[#493b30] md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#a28a72]">
              <BookOpen size={17} />
              <span className="text-xs uppercase tracking-[0.2em]">
                Your inner world
              </span>
            </div>

            <button
              onClick={startNewEntry}
              className="flex items-center gap-2 rounded-full border border-[#e3d5c3] bg-[#fffdf9] px-4 py-2.5 text-sm transition hover:bg-[#f1e8dc]"
            >
              <Plus size={15} />
              New entry
            </button>
          </div>

          <h1 className="mt-5 font-[var(--font-gloock)] text-4xl md:text-6xl">
            Dear, <span className="italic">someday.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#887765]">
            A quiet little space for your thoughts, gratitude,
            dreams, and everything you don't want to forget.
          </p>
        </div>

        {/* Editor */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e7dac8] bg-[#fffdf9] shadow-sm">

          {/* Paper decoration */}
          <div className="absolute left-0 top-0 h-full w-2 bg-[#eadbc6]" />

          <div className="px-6 py-8 md:px-12 md:py-10">

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-[#a38c73]">
              <CalendarDays size={15} />

              {selectedId
                ? "Editing a memory"
                : todayDate? formatDate(todayDate): ""}
            </div>

            {/* Daily prompt */}
            <div className="mt-7 rounded-2xl bg-[#f5eee4] p-5 md:p-6">

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#a1886c]">
                <Sparkles size={15} />
                Today's reflection
              </div>

              <p className="mt-4 font-[var(--font-gloock)] text-xl leading-relaxed md:text-2xl">
                {selectedId ? prompt : dailyPrompt}
              </p>

              <button
                onClick={() => {
                  setPrompt(dailyPrompt);
                  setSelectedId(null);
                }}
                className="mt-4 text-xs text-[#987b5d] underline underline-offset-4"
              >
                Use today's prompt
              </button>
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title..."
              className="mt-8 w-full border-b border-[#e9dfd2] bg-transparent pb-4 font-[var(--font-gloock)] text-2xl outline-none placeholder:text-[#c3b5a4] md:text-3xl"
            />

            {/* Mood */}
            <div className="mt-7">
              <p className="mb-3 text-xs uppercase tracking-widest text-[#a38a72]">
                How am I feeling?
              </p>

              <div className="flex flex-wrap gap-2">
                {moods.map((item) => (
                  <button
                    key={item.label}
                    onClick={() =>
                      setMood(
                        mood === item.label ? "" : item.label
                      )
                    }
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      mood === item.label
                        ? "border-[#b99d7c] bg-[#eee1cf] text-[#6f543c]"
                        : "border-[#eadfD2] bg-[#fffdf9] text-[#897967] hover:bg-[#f6eee4]"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude */}
            <div className="mt-8">
              <label className="mb-3 flex items-center gap-2 font-[var(--font-gloock)] text-xl">
                <Heart size={17} className="text-[#b28d72]" />
                Three things I'm grateful for
              </label>

              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder={"1. ...\n2. ...\n3. ..."}
                rows={4}
                className="w-full resize-y rounded-2xl border border-[#eee3d6] bg-[#fcf9f4] p-4 text-sm leading-7 outline-none transition focus:border-[#cbb49a] placeholder:text-[#c3b5a4]"
              />
            </div>

            {/* Main writing */}
            <div className="mt-8">
              <label className="mb-3 flex items-center gap-2 font-[var(--font-gloock)] text-xl">
                <PenLine size={17} className="text-[#b28d72]" />
                Dear diary...
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts wander. There's no right way to write here..."
                rows={12}
                className="w-full resize-y rounded-2xl border border-[#eee3d6] bg-[#fcf9f4] p-5 text-sm leading-8 outline-none transition focus:border-[#cbb49a] placeholder:text-[#c3b5a4]"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {/* Save */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">

              {selectedId ? (
                <button
                  onClick={startNewEntry}
                  className="text-sm text-[#998571] transition hover:text-[#574535]"
                >
                  Start a fresh entry
                </button>
              ) : (
                <p className="text-xs text-[#b09b85]">
                  Your thoughts are safe here 🤎
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#574535] px-6 py-3 text-sm text-[#faf7f0] transition hover:bg-[#715b45] disabled:opacity-50"
              >
                <Save size={15} />
                {saving
                  ? "Saving..."
                  : selectedId
                    ? "Update entry"
                    : "Save entry"}
              </button>
            </div>
          </div>
        </section>

        {/* Archive */}
        <section className="mt-16">

          <div className="mb-7">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a28c75]">
              Looking back
            </p>

            <h2 className="mt-2 font-[var(--font-gloock)] text-3xl">
              Pages from my life
            </h2>

            <p className="mt-2 text-sm text-[#93816e]">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} saved
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[#998775]">
              Turning the pages...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d9c9b6] px-6 py-14 text-center">
              <BookOpen
                size={30}
                className="mx-auto mb-4 text-[#b69b7d]"
              />

              <h3 className="font-[var(--font-gloock)] text-xl">
                Your story begins here
              </h3>

              <p className="mt-2 text-sm text-[#998775]">
                Your saved journal entries will find a home here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-3xl border p-6 transition ${
                    selectedId === entry.id
                      ? "border-[#c5a989] bg-[#f4ebdf]"
                      : "border-[#e8ddce] bg-[#fffdf9] hover:bg-[#f8f1e8]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    <button
                      onClick={() => editEntry(entry)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-xs text-[#a38a72]">
                        {formatDate(entry.created_at)}
                      </p>

                      <h3 className="mt-2 font-[var(--font-gloock)] text-xl">
                        {entry.title || "Untitled entry"}
                      </h3>

                      {entry.mood && (
                        <p className="mt-2 text-xs text-[#927c64]">
                          Mood:{" "}
                          {moods.find((m) => m.label === entry.mood)?.emoji}{" "}
                          {entry.mood}
                        </p>
                      )}

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8b7967]">
                        {entry.content || entry.gratitude || "A little moment captured."}
                      </p>

                      {entry.prompt && (
                        <p className="mt-3 line-clamp-2 text-xs italic text-[#a38c76]">
                          Prompt: {entry.prompt}
                        </p>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      title="Delete entry"
                      className="rounded-full p-2 text-[#b5a18c] transition hover:bg-[#eee2d4] hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => editEntry(entry)}
                    className="mt-5 flex items-center gap-2 text-xs text-[#967b5d]"
                  >
                    <PenLine size={13} />
                    Read & edit
                  </button>
                </article>
              ))}

            </div>
          )}
        </section>

        {/* Closing */}
        <div className="mt-16 pb-8 text-center">
          <Sparkles
            size={17}
            className="mx-auto mb-4 text-[#b69a79]"
          />

          <p className="font-[var(--font-gloock)] text-xl italic text-[#8b745b]">
            Your life is happening now.
          </p>
        </div>
      </div>
    </main>
  );
}
