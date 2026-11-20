
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Sparkles,
  Plus,
  Check,
  Trash2,
  Sun,
  Search,
  X,
  Feather,
} from "lucide-react";
import {
  getAffirmations,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation,
  type Affirmation,
} from "@/lib/affirmations";

const cream = "#FFFCF8";
const brown = "#493C38";
const muted = "#958477";
const border = "#E5D9CE";

const categories = [
  "All",
  "Self-love",
  "Confidence",
  "Abundance",
  "Career",
  "Love",
  "Peace",
  "Health",
  "Custom",
];

const categoryEmojis: Record<string, string> = {
  "Self-love": "🤎",
  Confidence: "✨",
  Abundance: "🌷",
  Career: "☀️",
  Love: "♡",
  Peace: "🕊️",
  Health: "🌿",
  Custom: "✍️",
};

const dailyAffirmations = [
  "I am becoming the woman I have always dreamed of being.",
  "Everything meant for me is finding its way to me.",
  "I am worthy of a life that feels beautiful from the inside.",
  "I trust the timing of my life.",
  "I am allowed to take up space and be fully myself.",
  "My dreams are valid, and I am capable of making them real.",
  "I welcome abundance, love, peace and beautiful opportunities.",
  "I do not have to rush. I am exactly where I need to be.",
  "I am proud of the person I am becoming.",
  "I deserve love that is gentle, honest and consistent.",
  "I am creating a life that feels like home to my soul.",
  "I trust myself to figure things out.",
  "I am magnetic to opportunities that align with me.",
  "I release what is not meant for me and welcome what is.",
  "My presence is enough. I do not need to prove my worth.",
  "I am capable of extraordinary things.",
  "I am safe to grow, change and begin again.",
  "I choose to believe beautiful things are possible for me.",
  "I have everything within me to create the life I desire.",
  "I deserve to experience joy without guilt.",
  "I am attracting friendships that feel like sunshine.",
  "I am becoming more confident with every passing day.",
  "My life is unfolding in ways that are better than I imagined.",
  "I honor my feelings without letting them define me.",
  "I am open to receiving the love and kindness I give.",
  "I am building a life filled with meaning and purpose.",
  "I am enough, exactly as I am today.",
  "I can be both a work in progress and deeply worthy.",
  "I am grateful for who I am and excited for who I will become.",
  "The universe is not against me. Life is happening for me.",
];

function getTodayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDailyAffirmation(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);

  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86400000
  );

  return dailyAffirmations[
    dayOfYear % dailyAffirmations.length
  ];
}

export default function AffirmationsPage() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);

  const [today, setToday] = useState("");
  const [dailyAffirmation, setDailyAffirmation] = useState(
    dailyAffirmations[0]
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Self-love");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();

    setToday(getTodayKey(now));
    setDailyAffirmation(getDailyAffirmation(now));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAffirmations();
        setAffirmations(data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your affirmations.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredAffirmations = useMemo(() => {
    return affirmations.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      const matchesFavorite =
        !favoritesOnly || item.is_favorite;

      const matchesSearch = item.content
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesFavorite && matchesSearch;
    });
  }, [affirmations, activeCategory, favoritesOnly, search]);

  async function handleCreate() {
    if (!newContent.trim() || saving) return;

    setSaving(true);
    setError("");

    try {
      const created = await createAffirmation({
        content: newContent.trim(),
        category: newCategory,
      });

      setAffirmations((prev) => [created, ...prev]);
      setNewContent("");
      setNewCategory("Self-love");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Couldn't save your affirmation.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(item: Affirmation) {
    try {
      const updated = await updateAffirmation(item.id, {
        is_favorite: !item.is_favorite,
      });

      setAffirmations((prev) =>
        prev.map((a) => (a.id === item.id ? updated : a))
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't update your favorite.");
    }
  }

  async function togglePracticed(item: Affirmation) {
    if (!today) return;

    const dates = item.practiced_dates || [];

    const updatedDates = dates.includes(today)
      ? dates.filter((date) => date !== today)
      : [...dates, today];

    try {
      const updated = await updateAffirmation(item.id, {
        practiced_dates: updatedDates,
      });

      setAffirmations((prev) =>
        prev.map((a) => (a.id === item.id ? updated : a))
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't update your practice.");
    }
  }

  async function handleDelete(item: Affirmation) {
    if (
      !window.confirm(
        "Delete this affirmation? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteAffirmation(item.id);

      setAffirmations((prev) =>
        prev.filter((a) => a.id !== item.id)
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this affirmation.");
    }
  }

  return (
    <main
      className="min-h-screen px-5 py-10 md:px-10"
      style={{ background: cream, color: brown }}
    >
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <header className="mb-12">
          <p
            className="text-xs uppercase tracking-[0.22em]"
            style={{ color: muted }}
          >
            A little love for your mind
          </p>

          <h1
            className="mt-3 text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-gloock)" }}
          >
            Affirmations
          </h1>

          <p className="mt-3 text-sm" style={{ color: muted }}>
            Gentle words. A kinder inner voice.
          </p>
        </header>

        {/* Daily affirmation */}
        <section
          className="rounded-[28px] px-7 py-10 text-center md:px-12 md:py-14"
          style={{
            background: "#EDE3D9",
            border: `1px solid ${border}`,
          }}
        >
          <Sparkles
            size={20}
            className="mx-auto mb-5"
            style={{ color: muted }}
          />

          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: muted }}
          >
            Today's reminder
          </p>

          <p
            className="mx-auto mt-6 max-w-2xl text-2xl leading-relaxed md:text-3xl"
            style={{ fontFamily: "var(--font-gloock)" }}
          >
            {dailyAffirmation}
          </p>

          <button
            onClick={() =>
              navigator.clipboard.writeText(dailyAffirmation)
            }
            className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition hover:opacity-80"
            style={{ background: brown, color: cream }}
          >
            <Feather size={15} />
            Keep this close
          </button>
        </section>

        {/* Collection */}
        <section className="mt-12">

          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              Words for me
            </h2>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm"
              style={{
                borderColor: border,
                background: showForm ? "#EDE3D9" : "transparent",
              }}
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? "Close" : "Add"}
            </button>
          </div>

          {/* Add affirmation */}
          {showForm && (
            <div
              className="mt-5 rounded-2xl border p-5"
              style={{ background: "#F5EEE7", borderColor: border }}
            >
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="I am worthy of every beautiful thing coming my way..."
                rows={3}
                className="w-full resize-none rounded-xl border p-4 text-sm leading-7 outline-none"
                style={{
                  background: cream,
                  color: brown,
                  borderColor: border,
                }}
              />

              <div className="mt-3 flex flex-wrap justify-between gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                  style={{
                    background: cream,
                    color: brown,
                    borderColor: border,
                  }}
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {categoryEmojis[category]} {category}
                      </option>
                    ))}
                </select>

                <button
                  onClick={handleCreate}
                  disabled={!newContent.trim() || saving}
                  className="rounded-full px-5 py-2.5 text-sm disabled:opacity-40"
                  style={{ background: brown, color: cream }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div
            className="mt-6 flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ background: "#fff", borderColor: border }}
          >
            <Search size={16} style={{ color: muted }} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a little reminder..."
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: brown }}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} style={{ color: muted }} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setFavoritesOnly(false);
                }}
                className="shrink-0 rounded-full border px-3.5 py-2 text-xs transition"
                style={{
                  background:
                    activeCategory === category && !favoritesOnly
                      ? brown
                      : "#fff",
                  color:
                    activeCategory === category && !favoritesOnly
                      ? cream
                      : muted,
                  borderColor: border,
                }}
              >
                {category !== "All" && categoryEmojis[category]}{" "}
                {category}
              </button>
            ))}

            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className="shrink-0 rounded-full border px-3.5 py-2 text-xs"
              style={{
                background: favoritesOnly ? "#B07C78" : "#fff",
                color: favoritesOnly ? "#fff" : muted,
                borderColor: border,
              }}
            >
              ♡ Favorites
            </button>
          </div>

          {/* List */}
          <div className="mt-5">
            {loading ? (
              <p
                className="py-12 text-center text-sm"
                style={{ color: muted }}
              >
                Gathering your words...
              </p>
            ) : filteredAffirmations.length === 0 ? (
              <div className="py-14 text-center">
                <span className="text-2xl">🌷</span>

                <p
                  className="mt-3"
                  style={{ fontFamily: "var(--font-gloock)" }}
                >
                  Your words will live here
                </p>

                <p className="mt-2 text-sm" style={{ color: muted }}>
                  Add something you want to remind yourself of.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: border }}>
                {filteredAffirmations.map((item) => {
                  const practiced =
                    item.practiced_dates?.includes(today);

                  return (
                    <article
                      key={item.id}
                      className="py-5"
                    >
                      <div className="flex items-start gap-4">
                        <p
                          className="flex-1 text-lg leading-8"
                          style={{ fontFamily: "var(--font-gloock)" }}
                        >
                          {item.content}
                        </p>

                        <button
                          onClick={() => toggleFavorite(item)}
                          aria-label="Toggle favorite"
                          className="shrink-0 pt-1"
                        >
                          <Heart
                            size={18}
                            fill={
                              item.is_favorite
                                ? "#B07C78"
                                : "transparent"
                            }
                            style={{
                              color: item.is_favorite
                                ? "#B07C78"
                                : muted,
                            }}
                          />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className="text-xs"
                          style={{ color: muted }}
                        >
                          {categoryEmojis[item.category] || "✨"}{" "}
                          {item.category}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => togglePracticed(item)}
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: muted }}
                          >
                            {practiced ? (
                              <Check size={14} />
                            ) : (
                              <Sun size={14} />
                            )}
                            {practiced ? "Today" : "Repeat"}
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            aria-label="Delete affirmation"
                            style={{ color: muted }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <p
          className="mt-10 pb-8 text-center text-sm"
          style={{
            color: muted,
            fontFamily: "var(--font-gloock)",
          }}
        >
          Speak to yourself like someone you love. ♡
        </p>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
