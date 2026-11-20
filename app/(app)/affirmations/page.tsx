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

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDailyAffirmation() {
  const date = new Date();
  const startOfYear = new Date(date.getFullYear(), 0, 0);

  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86400000,
  );

  return dailyAffirmations[dayOfYear % dailyAffirmations.length];
}

export default function AffirmationsPage() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Self-love");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = getTodayKey();
  const dailyAffirmation = getDailyAffirmation();

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

  const practicedToday = affirmations.filter((item) =>
    item.practiced_dates?.includes(today),
  ).length;

  const favoriteCount = affirmations.filter(
    (item) => item.is_favorite,
  ).length;

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
        prev.map((a) => (a.id === item.id ? updated : a)),
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't update your favorite.");
    }
  }

  async function togglePracticed(item: Affirmation) {
    const dates = item.practiced_dates || [];

    const updatedDates = dates.includes(today)
      ? dates.filter((date) => date !== today)
      : [...dates, today];

    try {
      const updated = await updateAffirmation(item.id, {
        practiced_dates: updatedDates,
      });

      setAffirmations((prev) =>
        prev.map((a) => (a.id === item.id ? updated : a)),
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't update today's practice.");
    }
  }

  async function handleDelete(item: Affirmation) {
    const confirmed = window.confirm(
      "Delete this affirmation? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await deleteAffirmation(item.id);

      setAffirmations((prev) =>
        prev.filter((a) => a.id !== item.id),
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this affirmation.");
    }
  }

  return (
    <main
      className="min-h-screen px-5 py-8 md:px-10"
      style={{ background: cream, color: brown }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10">
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

          <p
            className="mt-3 max-w-xl text-sm leading-7"
            style={{ color: muted }}
          >
            Words you choose to believe. Gentle reminders of who
            you are, what you deserve, and the life you're creating.
          </p>
        </header>

        {/* Daily affirmation */}
        <section
          className="relative overflow-hidden rounded-[28px] p-7 md:p-11"
          style={{
            background: "#EDE3D9",
            border: `1px solid ${border}`,
          }}
        >
          <div className="absolute right-5 top-5 opacity-20 md:right-10 md:top-8">
            <Sparkles size={65} />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Sun size={17} />
            <span className="tracking-wide">YOUR DAILY AFFIRMATION</span>
          </div>

          <p
            className="mt-7 max-w-3xl text-2xl leading-relaxed md:text-4xl md:leading-relaxed"
            style={{ fontFamily: "var(--font-gloock)" }}
          >
            "{dailyAffirmation}"
          </p>

          <p className="mt-5 text-sm" style={{ color: muted }}>
            Take a deep breath. Read it slowly. Let it sink in.
          </p>

          <button
            onClick={() =>
              navigator.clipboard.writeText(dailyAffirmation)
            }
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition hover:opacity-80"
            style={{ background: brown, color: cream }}
          >
            <Feather size={15} />
            Carry this with me
          </button>
        </section>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div
            className="rounded-2xl border p-5"
            style={{ background: "#fff", borderColor: border }}
          >
            <div className="flex items-center gap-2">
              <Sun size={17} style={{ color: muted }} />
              <p className="text-sm" style={{ color: muted }}>
                Practiced today
              </p>
            </div>

            <p
              className="mt-3 text-3xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              {practicedToday}
            </p>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "#fff", borderColor: border }}
          >
            <div className="flex items-center gap-2">
              <Heart size={17} style={{ color: muted }} />
              <p className="text-sm" style={{ color: muted }}>
                Favorites
              </p>
            </div>

            <p
              className="mt-3 text-3xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              {favoriteCount}
            </p>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "#fff", borderColor: border }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={17} style={{ color: muted }} />
              <p className="text-sm" style={{ color: muted }}>
                My collection
              </p>
            </div>

            <p
              className="mt-3 text-3xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              {affirmations.length}
            </p>
          </div>
        </div>

        {/* Collection header */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                className="text-2xl md:text-3xl"
                style={{ fontFamily: "var(--font-gloock)" }}
              >
                My little collection
              </h2>

              <p className="mt-2 text-sm" style={{ color: muted }}>
                Keep the words that feel like they were meant for you.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-sm transition hover:opacity-80"
              style={{ background: brown, color: cream }}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Close" : "Write an affirmation"}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div
              className="mt-6 rounded-2xl border p-5 md:p-7"
              style={{ background: "#F5EEE7", borderColor: border }}
            >
              <p
                className="mb-4 text-xl"
                style={{ fontFamily: "var(--font-gloock)" }}
              >
                A little reminder for myself...
              </p>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="I am worthy of every beautiful thing coming my way..."
                rows={4}
                className="w-full resize-none rounded-xl border p-4 text-sm leading-7 outline-none"
                style={{
                  background: cream,
                  color: brown,
                  borderColor: border,
                }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{
                    background: cream,
                    color: brown,
                    borderColor: border,
                  }}
                >
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {categoryEmojis[category]} {category}
                      </option>
                    ))}
                </select>

                <button
                  onClick={handleCreate}
                  disabled={!newContent.trim() || saving}
                  className="rounded-full px-5 py-3 text-sm disabled:opacity-40"
                  style={{ background: brown, color: cream }}
                >
                  {saving ? "Saving..." : "Save to my collection"}
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div
            className="mt-6 flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ background: "#fff", borderColor: border }}
          >
            <Search size={17} style={{ color: muted }} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find an affirmation..."
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: brown }}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} style={{ color: muted }} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setFavoritesOnly(false);
                }}
                className="shrink-0 rounded-full border px-4 py-2 text-sm transition"
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
              className="shrink-0 rounded-full border px-4 py-2 text-sm"
              style={{
                background: favoritesOnly ? "#B07C78" : "#fff",
                color: favoritesOnly ? "#fff" : muted,
                borderColor: border,
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Heart size={14} />
                Favorites
              </span>
            </button>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="py-20 text-center">
              <Sparkles
                size={22}
                className="mx-auto animate-pulse"
                style={{ color: muted }}
              />
              <p className="mt-3 text-sm" style={{ color: muted }}>
                Gathering your little reminders...
              </p>
            </div>
          ) : filteredAffirmations.length === 0 ? (
            <div
              className="mt-5 rounded-2xl border border-dashed p-12 text-center"
              style={{ borderColor: border }}
            >
              <span className="text-3xl">🌷</span>

              <h3
                className="mt-4 text-xl"
                style={{ fontFamily: "var(--font-gloock)" }}
              >
                Nothing here just yet
              </h3>

              <p className="mt-2 text-sm" style={{ color: muted }}>
                Write your first affirmation and let it live here.
              </p>

              <button
                onClick={() => {
                  setShowForm(true);
                  setFavoritesOnly(false);
                  setActiveCategory("All");
                }}
                className="mt-5 text-sm underline underline-offset-4"
                style={{ color: brown }}
              >
                Create my first affirmation
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAffirmations.map((item) => {
                const practiced = item.practiced_dates?.includes(today);

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5"
                    style={{
                      background: "#fff",
                      borderColor: border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="rounded-full px-3 py-1 text-xs"
                        style={{
                          background: "#F5EEE7",
                          color: muted,
                        }}
                      >
                        {categoryEmojis[item.category] || "✨"}{" "}
                        {item.category}
                      </span>

                      <button
                        onClick={() => toggleFavorite(item)}
                        aria-label="Toggle favorite"
                        className="rounded-full p-1.5 transition hover:scale-110"
                      >
                        <Heart
                          size={18}
                          fill={item.is_favorite ? "#B07C78" : "none"}
                          style={{
                            color: item.is_favorite
                              ? "#B07C78"
                              : border,
                          }}
                        />
                      </button>
                    </div>

                    <p
                      className="my-6 flex-1 text-lg leading-8"
                      style={{ fontFamily: "var(--font-gloock)" }}
                    >
                      "{item.content}"
                    </p>

                    <div
                      className="flex items-center justify-between border-t pt-4"
                      style={{ borderColor: "#F0E9E2" }}
                    >
                      <button
                        onClick={() => togglePracticed(item)}
                        className="flex items-center gap-2 rounded-full px-3 py-2 text-xs transition"
                        style={{
                          background: practiced ? "#E8E0D7" : "#F8F4EF",
                          color: brown,
                        }}
                      >
                        {practiced ? (
                          <Check size={14} />
                        ) : (
                          <Sun size={14} />
                        )}

                        {practiced ? "Practiced today" : "I repeated this"}
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        aria-label="Delete affirmation"
                        className="rounded-full p-2 opacity-50 transition hover:opacity-100"
                        style={{ color: muted }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Closing note */}
        <div className="mt-12 pb-10 text-center">
          <Heart
            size={18}
            className="mx-auto"
            style={{ color: "#B07C78" }}
          />

          <p
            className="mt-3 text-lg"
            style={{ fontFamily: "var(--font-gloock)", color: muted }}
          >
            Speak to yourself like someone you love.
          </p>
        </div>

        {error && (
          <p
            className="mt-5 text-center text-sm"
            style={{ color: "#B65F55" }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}