
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Sparkles,
  Heart,
  ArrowUpRight,
  Trash2,
  Search,
  X,
  Pencil,
  CalendarDays,
  Flower2,
  CheckCircle2,
  Circle,
} from "lucide-react";

import {
  getDreams,
  createDream,
  updateDream,
  deleteDream,
  type Dream,
  type DreamCategory,
  type DreamStatus,
  type NewDream,
} from "@/lib/dreams";

const categories: DreamCategory[] = [
  "Career",
  "Education",
  "Travel",
  "Relationships",
  "Lifestyle",
  "Personal",
  "Health",
  "Finance",
  "Other",
];

const statuses: { value: DreamStatus; label: string }[] = [
  { value: "dreaming", label: "Dreaming" },
  { value: "in_progress", label: "In progress" },
  { value: "almost_there", label: "Almost there" },
  { value: "manifested", label: "Manifested" },
];

const covers = [
  "#E8DCD1",
  "#D8D5E5",
  "#E8D6D5",
  "#DCE3D5",
  "#E9E1C8",
  "#D9E3E8",
];

const statusStyles: Record<DreamStatus, string> = {
  dreaming: "bg-[#EDE5DC] text-[#806F60]",
  in_progress: "bg-[#E3E5D8] text-[#68704F]",
  almost_there: "bg-[#F0E3D2] text-[#9B7650]",
  manifested: "bg-[#E5DDE8] text-[#79617F]",
};

const emptyForm = {
  title: "",
  description: "",
  why: "",
  category: "Personal" as DreamCategory,
  status: "dreaming" as DreamStatus,
  target_date: "",
};

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const data = await getDreams();

        if (!cancelled) {
          setDreams(data);
        }
      } catch (err) {
        console.error("Failed to load dreams:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load your dreams."
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const manifestedCount = dreams.filter(
    (dream) => dream.status === "manifested"
  ).length;

  const inProgressCount = dreams.filter(
    (dream) =>
      dream.status === "in_progress" ||
      dream.status === "almost_there"
  ).length;

  const filteredDreams = useMemo(() => {
    return dreams.filter((dream) => {
      const matchesCategory =
        activeCategory === "All" ||
        dream.category === activeCategory;

      const matchesStatus =
        activeStatus === "All" ||
        dream.status === activeStatus;

      const matchesSearch =
        dream.title.toLowerCase().includes(search.toLowerCase()) ||
        dream.description?.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [dreams, activeCategory, activeStatus, search]);

  function openCreate() {
    setEditingDream(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  }

  function openEdit(dream: Dream) {
    setEditingDream(dream);

    setForm({
      title: dream.title,
      description: dream.description || "",
      why: dream.why || "",
      category: dream.category,
      status: dream.status,
      target_date: dream.target_date || "",
    });

    setShowModal(true);
    setError("");
  }

  async function handleSave() {
    if (!form.title.trim() || saving) return;

    setSaving(true);
    setError("");

    const payload: NewDream = {
      title: form.title.trim(),
      description: form.description.trim(),
      why: form.why.trim(),
      category: form.category,
      status: form.status,
      target_date: form.target_date || null,
      cover_image: editingDream?.cover_image || null,
      steps: editingDream?.steps || [],
      updates: editingDream?.updates || [],
    };

    try {
      if (editingDream) {
        const updated = await updateDream(
          editingDream.id,
          payload
        );

        setDreams((previous) =>
          previous.map((dream) =>
            dream.id === updated.id ? updated : dream
          )
        );
      } else {
        const created = await createDream(payload);

        setDreams((previous) => [created, ...previous]);
      }

      setShowModal(false);
      setEditingDream(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Failed to save dream:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save your dream. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (saving) return;

    const confirmed = window.confirm(
      "Are you sure you want to let go of this dream?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

    try {
      await deleteDream(id);

      setDreams((previous) =>
        previous.filter((dream) => dream.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete dream:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't delete this dream."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    dream: Dream,
    status: DreamStatus
  ) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const updated = await updateDream(dream.id, { status });

      setDreams((previous) =>
        previous.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update dream status."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <p className="text-sm text-[#958477]">
          Gathering the things you're dreaming of...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-9 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-[#958477]">
            Everything begins with a little dream ♡
          </p>

          <h1 className="font-[var(--font-gloock)] text-4xl text-[#493C38]">
            My dreams
          </h1>

          <p className="mt-3 max-w-md text-sm leading-7 text-[#958477]">
            A little collection of everything I hope to
            experience, become and create.
          </p>
        </div>

        <button
          onClick={openCreate}
          disabled={saving}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#493C38] px-5 py-3 text-sm text-[#FFFCF8] transition hover:bg-[#66534B] disabled:opacity-50"
        >
          <Plus size={16} />
          Add a dream
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-[#F4E3E0] px-4 py-3 text-sm text-[#9B5C55]">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Overview */}
      <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#F0E8DF] p-5">
          <div className="mb-3 flex items-center justify-between">
            <Heart size={18} className="text-[#958477]" />
            <span className="text-xs text-[#958477]">In my heart</span>
          </div>
          <p className="font-[var(--font-gloock)] text-3xl text-[#493C38]">
            {dreams.length}
          </p>
          <p className="mt-1 text-xs text-[#958477]">
            Dreams collected
          </p>
        </div>

        <div className="rounded-2xl bg-[#E7E8DF] p-5">
          <div className="mb-3 flex items-center justify-between">
            <Sparkles size={18} className="text-[#788064]" />
            <span className="text-xs text-[#788064]">On my way</span>
          </div>
          <p className="font-[var(--font-gloock)] text-3xl text-[#493C38]">
            {inProgressCount}
          </p>
          <p className="mt-1 text-xs text-[#958477]">
            Dreams in progress
          </p>
        </div>

        <div className="rounded-2xl bg-[#EAE2EC] p-5">
          <div className="mb-3 flex items-center justify-between">
            <CheckCircle2 size={18} className="text-[#806B87]" />
            <span className="text-xs text-[#806B87]">Little miracles</span>
          </div>
          <p className="font-[var(--font-gloock)] text-3xl text-[#493C38]">
            {manifestedCount}
          </p>
          <p className="mt-1 text-xs text-[#958477]">
            Dreams manifested
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-3 rounded-full border border-[#E5DAD0] bg-[#FFFCF8] px-4 py-3">
        <Search size={17} className="text-[#A89585]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a little dream..."
          className="w-full bg-transparent text-sm text-[#493C38] outline-none placeholder:text-[#B4A18F]"
        />

        {search && (
          <button onClick={() => setSearch("")}>
            <X size={15} className="text-[#958477]" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...categories].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-xs transition ${
              activeCategory === category
                ? "bg-[#493C38] text-white"
                : "border border-[#E5DAD0] text-[#958477] hover:bg-[#F0E8DF]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-[#A89585]">
          Status:
        </span>

        <button
          onClick={() => setActiveStatus("All")}
          className={`rounded-full px-3 py-1.5 text-xs ${
            activeStatus === "All"
              ? "bg-[#E8DCD1] text-[#493C38]"
              : "text-[#958477] hover:bg-[#F0E8DF]"
          }`}
        >
          All
        </button>

        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => setActiveStatus(status.value)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              activeStatus === status.value
                ? "bg-[#E8DCD1] text-[#493C38]"
                : "text-[#958477] hover:bg-[#F0E8DF]"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {dreams.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#D8CBBE] bg-[#FFFCF8] px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
            <Flower2 size={26} className="text-[#958477]" />
          </div>

          <h2 className="mb-2 font-[var(--font-gloock)] text-2xl text-[#493C38]">
            A thousand beautiful possibilities
          </h2>

          <p className="mx-auto mb-6 max-w-sm text-sm leading-7 text-[#958477]">
            Write down the things your heart is hoping for.
            There is room for every little dream here.
          </p>

          <button
            onClick={openCreate}
            className="rounded-full border border-[#D8CBBE] px-6 py-3 text-sm text-[#493C38] transition hover:bg-[#F5F0E8]"
          >
            Write your first dream ♡
          </button>
        </div>
      )}

      {/* No filter results */}
      {dreams.length > 0 && filteredDreams.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#D8CBBE] bg-[#FFFCF8] px-6 py-14 text-center">
          <Search size={23} className="mx-auto mb-4 text-[#B4A18F]" />
          <h2 className="font-[var(--font-gloock)] text-xl text-[#493C38]">
            Nothing found just yet
          </h2>
          <p className="mt-2 text-sm text-[#958477]">
            Try another search or category.
          </p>
        </div>
      )}

      {/* Dream cards */}
      {filteredDreams.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDreams.map((dream, index) => {
            const completedSteps = dream.steps?.filter(
              (step) => step.completed
            ).length || 0;

            const totalSteps = dream.steps?.length || 0;

            const progress =
              dream.status === "manifested"
                ? 100
                : totalSteps > 0
                  ? Math.round((completedSteps / totalSteps) * 100)
                  : 0;

            return (
              <div key={dream.id} className="group relative">
                <div
                  className="relative overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1"
                  style={{
                    backgroundColor: covers[index % covers.length],
                  }}
                >
                  {dream.cover_image ? (
                    <img
                      src={dream.cover_image}
                      alt={dream.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center p-7 text-center">
                      <Heart
                        size={20}
                        className="mb-4 text-[#493C38]/50"
                      />

                      <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
                        {dream.title}
                      </h2>

                      {dream.description && (
                        <p className="mt-3 line-clamp-3 max-w-[230px] text-sm leading-6 text-[#493C38]/70">
                          {dream.description}
                        </p>
                      )}

                      <span className="mt-5 rounded-full bg-white/40 px-3 py-1 text-xs text-[#493C38]/70">
                        {dream.category}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => openEdit(dream)}
                    className="absolute right-4 top-4 rounded-full bg-white/60 p-2 text-[#493C38] opacity-0 backdrop-blur transition hover:bg-white group-hover:opacity-100"
                    aria-label="Edit dream"
                  >
                    <Pencil size={15} />
                  </button>
                </div>

                <div className="mt-3 px-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-[var(--font-gloock)] text-lg text-[#493C38]">
                        {dream.title}
                      </h3>

                      <p className="mt-1 text-xs text-[#958477]">
                        {dream.category}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(dream.id)}
                      disabled={saving}
                      className="rounded-full p-2 text-[#B4A18F] transition hover:bg-[#E8DCD1] hover:text-[#493C38] disabled:opacity-40"
                      aria-label="Delete dream"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="mt-3">
                    <select
                      value={dream.status}
                      disabled={saving}
                      onChange={(e) =>
                        handleStatusChange(
                          dream,
                          e.target.value as DreamStatus
                        )
                      }
                      className={`rounded-full border-0 px-3 py-1.5 text-xs outline-none ${statusStyles[dream.status]}`}
                    >
                      {statuses.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Progress */}
                  {totalSteps > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs text-[#958477]">
                        <span>
                          {completedSteps} of {totalSteps} steps
                        </span>
                        <span>{progress}%</span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#E9E0D7]">
                        <div
                          className="h-full rounded-full bg-[#958477] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {dream.target_date && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-[#958477]">
                      <CalendarDays size={13} />
                      By{" "}
                      {new Date(
                        `${dream.target_date}T12:00:00`
                      ).toLocaleDateString("en", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add another dream */}
          <button
            onClick={openCreate}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8CBBE] text-[#958477] transition hover:bg-[#FFFCF8]"
          >
            <Plus size={24} />
            <span className="mt-3 text-sm">
              Another little dream...
            </span>
          </button>
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#493C38]/30 p-4 backdrop-blur-sm"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-md rounded-3xl bg-[#FFFCF8] p-7 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs tracking-widest text-[#958477] uppercase">
                  A little something to look forward to
                </p>

                <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
                  {editingDream ? "Edit your dream" : "A new little dream"}
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-full p-2 text-[#958477] hover:bg-[#F0E8DF]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  What are we dreaming of?
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Build my dream career"
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  Describe your dream
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What does this dream look and feel like?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  Why does this matter to you?
                </label>

                <textarea
                  value={form.why}
                  onChange={(e) =>
                    setForm({ ...form, why: e.target.value })
                  }
                  placeholder="A little reminder of why you're doing this..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as DreamCategory,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  Current status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as DreamStatus,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none"
                >
                  {statuses.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  A date to look forward to (optional)
                </label>

                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      target_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!form.title.trim() || saving}
                className="mt-3 w-full rounded-full bg-[#493C38] py-3 text-sm text-white transition hover:bg-[#66534B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? "Saving your dream..."
                  : editingDream
                    ? "Save changes ♡"
                    : "Add to my dreams ♡"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="w-full py-2 text-sm text-[#958477]"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
