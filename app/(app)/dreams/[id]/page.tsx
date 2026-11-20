"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Circle,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  BookOpen,
  CalendarDays,
  Target,
} from "lucide-react";

import {
  getDreams,
  updateDream,
  type Dream,
  type DreamStep,
  type DreamUpdate,
} from "@/lib/dreams";

const brown = "#493C38";
const muted = "#958477";
const cream = "#FFFCF8";
const border = "#D8CBBE";

const statusLabels: Record<string, string> = {
  dreaming: "Dreaming",
  in_progress: "In progress",
  almost_there: "Almost there",
  manifested: "Manifested ✨",
};

function DreamDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newStep, setNewStep] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [justManifested, setJustManifested] = useState(false);

  // Load dream
  useEffect(() => {
    async function loadDream() {
      try {
        const dreams = await getDreams();
        const found = dreams.find((item) => item.id === id);

        if (!found) {
          setError("We couldn't find this dream.");
          return;
        }

        setDream(found);
      } catch (err) {
        console.error(err);
        setError("Something went wrong loading your dream.");
      } finally {
        setLoading(false);
      }
    }

    loadDream();
  }, [id]);

  // Save changes
  async function saveChanges(
    updates: Partial<Dream>,
  ): Promise<boolean> {
    if (!dream) return false;

    setSaving(true);
    setError("");

    try {
      const updated = await updateDream(dream.id, updates);
      setDream(updated);
      return true;
    } catch (err) {
      console.error(err);
      setError("Couldn't save your changes. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  // Add a step
  async function addStep() {
    if (!newStep.trim() || !dream || saving) return;

    const step: DreamStep = {
      id: crypto.randomUUID(),
      title: newStep.trim(),
      completed: false,
    };

    const success = await saveChanges({
      steps: [...(dream.steps || []), step],
    });

    if (success) {
      setNewStep("");
    }
  }

  // Toggle step completion
  async function toggleStep(stepId: string) {
    if (!dream || saving) return;

    const updatedSteps = (dream.steps || []).map((step) =>
      step.id === stepId
        ? { ...step, completed: !step.completed }
        : step,
    );

    const completedCount = updatedSteps.filter(
      (step) => step.completed,
    ).length;

    let nextStatus = dream.status;

    if (
      updatedSteps.length > 0 &&
      completedCount === updatedSteps.length
    ) {
      if (dream.status !== "manifested") {
        nextStatus = "almost_there";
      }
    } else if (
      completedCount > 0 &&
      dream.status === "dreaming"
    ) {
      nextStatus = "in_progress";
    } else if (
      completedCount === 0 &&
      dream.status === "almost_there"
    ) {
      nextStatus = "in_progress";
    }

    await saveChanges({
      steps: updatedSteps,
      status: nextStatus,
    });
  }

  // Delete a step
  async function deleteStep(stepId: string) {
    if (!dream || saving) return;

    await saveChanges({
      steps: (dream.steps || []).filter(
        (step) => step.id !== stepId,
      ),
    });
  }

  // Add journal update
  async function addUpdate() {
    if (!newUpdate.trim() || !dream || saving) return;

    const update: DreamUpdate = {
      id: crypto.randomUUID(),
      content: newUpdate.trim(),
      createdAt: new Date().toISOString(),
    };

    const success = await saveChanges({
      updates: [update, ...(dream.updates || [])],
    });

    if (success) {
      setNewUpdate("");
    }
  }

  // Manifest dream
  async function markManifested() {
    if (!dream || saving) return;

    const manifestedAt = new Date().toISOString();

    const manifestationUpdate: DreamUpdate = {
      id: crypto.randomUUID(),
      content: "✨ I manifested this dream. It is now my reality.",
      createdAt: manifestedAt,
    };

    const success = await saveChanges({
      status: "manifested",
      manifested_at: manifestedAt,
      updates: [
        manifestationUpdate,
        ...(dream.updates || []),
      ],
    });

    if (success) {
      setJustManifested(true);
    }
  }

  // Progress
  const completedSteps =
    dream?.steps?.filter((step) => step.completed).length || 0;

  const totalSteps = dream?.steps?.length || 0;

  const progress =
    totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: cream, color: muted }}
      >
        <Sparkles className="animate-pulse mr-2" size={18} />
        <p>Gathering your dream...</p>
      </div>
    );
  }

  // Not found
  if (!dream) {
    return (
      <div
        className="min-h-screen p-8 text-center"
        style={{ background: cream, color: brown }}
      >
        <p>{error || "Dream not found."}</p>

        <button
          onClick={() => router.push("/dreams")}
          className="mt-5 underline"
        >
          Return to dreams
        </button>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen px-5 py-8 md:px-10"
      style={{ background: cream, color: brown }}
    >
      <div className="mx-auto max-w-4xl">

        {/* Back button */}
        <button
          onClick={() => router.push("/dreams")}
          className="mb-8 flex items-center gap-2 text-sm transition hover:opacity-70"
          style={{ color: muted }}
        >
          <ArrowLeft size={16} />
          Back to my dreams
        </button>

        {/* Hero section */}
        <section
          className="rounded-3xl border p-7 md:p-10"
          style={{
            background: "#F5EEE7",
            borderColor: border,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="rounded-full px-4 py-1.5 text-xs tracking-wide"
              style={{
                background: "#E5DAD0",
                color: brown,
              }}
            >
              {dream.category}
            </span>

            <span className="text-sm" style={{ color: muted }}>
              {statusLabels[dream.status] || dream.status}
            </span>
          </div>

          <h1
            className="mt-6 text-4xl leading-tight md:text-5xl"
            style={{
              fontFamily: "var(--font-gloock)",
              color: brown,
            }}
          >
            {dream.title}
          </h1>

          {dream.description && (
            <p
              className="mt-4 max-w-2xl text-base leading-7"
              style={{ color: muted }}
            >
              {dream.description}
            </p>
          )}

          {dream.why && (
            <div className="mt-7 flex gap-3">
              <Heart
                size={19}
                className="mt-1 shrink-0"
                style={{ color: "#B07C78" }}
              />

              <div>
                <p className="text-sm font-medium" style={{ color: brown }}>
                  Why this dream matters to me
                </p>

                <p
                  className="mt-2 whitespace-pre-wrap leading-7"
                  style={{ color: muted }}
                >
                  {dream.why}
                </p>
              </div>
            </div>
          )}

          {dream.target_date && (
            <div
              className="mt-6 flex items-center gap-2 text-sm"
              style={{ color: muted }}
            >
              <CalendarDays size={16} />

              Target date:{" "}
              {new Date(
                dream.target_date + "T00:00:00",
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}

          {dream.manifested_at && (
            <div
              className="mt-4 flex items-center gap-2 text-sm"
              style={{ color: brown }}
            >
              <Sparkles size={16} />

              Manifested on{" "}
              {new Date(dream.manifested_at).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                },
              )}
            </div>
          )}
        </section>

        {/* Progress section */}
        <section
          className="mt-6 rounded-2xl border p-6"
          style={{
            background: "#fff",
            borderColor: border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={20} style={{ color: muted }} />

              <div>
                <h2 className="font-medium">My progress</h2>

                <p
                  className="mt-1 text-sm"
                  style={{ color: muted }}
                >
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>
            </div>

            <span
              className="text-2xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              {progress}%
            </span>
          </div>

          <div
            className="mt-5 h-2.5 overflow-hidden rounded-full"
            style={{ background: "#EDE5DD" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "#958477",
              }}
            />
          </div>
        </section>

        {/* Action steps */}
        <section
          className="mt-6 rounded-2xl border p-6 md:p-8"
          style={{
            background: "#fff",
            borderColor: border,
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} style={{ color: muted }} />

            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              Little steps, big dreams
            </h2>
          </div>

          <p className="mt-2 text-sm" style={{ color: muted }}>
            Every little step is bringing you closer.
          </p>

          {/* Add step */}
          <div className="mt-6 flex gap-2">
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addStep();
              }}
              placeholder="Add a step toward this dream..."
              className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: border,
                background: cream,
                color: brown,
              }}
            />

            <button
              onClick={addStep}
              disabled={!newStep.trim() || saving}
              className="flex items-center justify-center rounded-xl px-4 transition hover:opacity-80 disabled:opacity-40"
              style={{
                background: brown,
                color: cream,
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Steps list */}
          <div className="mt-5 space-y-3">
            {dream.steps?.map((step) => (
              <div
                key={step.id}
                className="group flex items-center gap-3 rounded-xl p-3 transition"
                style={{ background: "#FAF7F3" }}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  disabled={saving}
                  className="shrink-0 disabled:opacity-50"
                  aria-label="Toggle step"
                >
                  {step.completed ? (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{
                        background: "#958477",
                        color: "#fff",
                      }}
                    >
                      <Check size={13} />
                    </span>
                  ) : (
                    <Circle size={19} style={{ color: border }} />
                  )}
                </button>

                <span
                  className={`flex-1 text-sm ${
                    step.completed ? "line-through opacity-50" : ""
                  }`}
                >
                  {step.title}
                </span>

                <button
                  onClick={() => deleteStep(step.id)}
                  disabled={saving}
                  className="opacity-0 transition group-hover:opacity-100 disabled:opacity-30"
                  aria-label="Delete step"
                  style={{ color: muted }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {(!dream.steps || dream.steps.length === 0) && (
              <div
                className="rounded-xl border border-dashed p-6 text-center text-sm"
                style={{
                  borderColor: border,
                  color: muted,
                }}
              >
                Your journey begins with one little step.
              </div>
            )}
          </div>
        </section>

        {/* Dream journal */}
        <section
          className="mt-6 rounded-2xl border p-6 md:p-8"
          style={{
            background: "#fff",
            borderColor: border,
          }}
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} style={{ color: muted }} />

            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              Dream journal
            </h2>
          </div>

          <p className="mt-2 text-sm" style={{ color: muted }}>
            Write down progress, thoughts, signs, little wins or
            anything you want to remember along the way.
          </p>

          <textarea
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Today, I..."
            rows={4}
            className="mt-5 w-full resize-none rounded-xl border p-4 text-sm outline-none"
            style={{
              borderColor: border,
              background: cream,
              color: brown,
            }}
          />

          <button
            onClick={addUpdate}
            disabled={!newUpdate.trim() || saving}
            className="mt-3 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition hover:opacity-80 disabled:opacity-40"
            style={{
              background: brown,
              color: cream,
            }}
          >
            <Plus size={15} />
            Add to journal
          </button>

          {/* Journal entries */}
          <div className="mt-8 space-y-4">
            {dream.updates?.map((update) => (
              <article
                key={update.id}
                className="rounded-xl p-5"
                style={{ background: "#FAF7F3" }}
              >
                <p className="text-xs" style={{ color: muted }}>
                  {new Date(update.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                  {update.content}
                </p>
              </article>
            ))}

            {(!dream.updates || dream.updates.length === 0) && (
              <p
                className="py-4 text-center text-sm"
                style={{ color: muted }}
              >
                Your memories will live here. 🤎
              </p>
            )}
          </div>
        </section>

        {/* Manifest your dream */}
        {dream.status !== "manifested" && (
          <section
            className="mt-8 rounded-2xl p-7 text-center"
            style={{ background: "#EAE0D6" }}
          >
            <Sparkles
              size={24}
              className="mx-auto"
              style={{ color: muted }}
            />

            <h2
              className="mt-3 text-2xl"
              style={{ fontFamily: "var(--font-gloock)" }}
            >
              When the dream becomes your reality...
            </h2>

            <p
              className="mx-auto mt-2 max-w-md text-sm leading-6"
              style={{ color: muted }}
            >
              Give yourself a moment to celebrate how far you've come.
              Your dream deserves to be remembered.
            </p>

            <button
              onClick={markManifested}
              disabled={saving}
              className="mt-5 rounded-full px-6 py-3 text-sm transition hover:opacity-80 disabled:opacity-50"
              style={{
                background: brown,
                color: cream,
              }}
            >
              ✨ I manifested this dream
            </button>
          </section>
        )}

        {/* Manifested celebration */}
        {dream.status === "manifested" && (
          <section
            className="relative mt-8 overflow-hidden rounded-3xl p-8 text-center md:p-12"
            style={{ background: "#EAE0D6" }}
          >
            <style jsx>{`
              @keyframes celebrationPop {
                0% {
                  transform: scale(0.5);
                  opacity: 0;
                }
                60% {
                  transform: scale(1.15);
                  opacity: 1;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }

              @keyframes sparkleFloat {
                0% {
                  transform: translateY(15px) scale(0.5);
                  opacity: 0;
                }
                50% {
                  opacity: 1;
                }
                100% {
                  transform: translateY(-25px) scale(1.2);
                  opacity: 0;
                }
              }
            `}</style>

            {/* Floating celebration */}
            {justManifested && (
              <div className="pointer-events-none absolute inset-0">
                {["✨", "🤎", "🌸", "⭐", "✨", "🌷", "🤎"].map(
                  (symbol, index) => (
                    <span
                      key={index}
                      className="absolute text-xl"
                      style={{
                        left: `${10 + index * 12}%`,
                        top: `${20 + (index % 3) * 20}%`,
                        animation: `sparkleFloat ${
                          1.5 + (index % 3) * 0.4
                        }s ease-out forwards`,
                        animationDelay: `${index * 0.12}s`,
                      }}
                    >
                      {symbol}
                    </span>
                  ),
                )}
              </div>
            )}

            <div
              className="relative"
              style={{
                animation: justManifested
                  ? "celebrationPop 0.6s ease-out"
                  : undefined,
              }}
            >
              <span className="text-4xl">✨🤎✨</span>

              <h2
                className="mt-4 text-3xl leading-snug md:text-4xl"
                style={{ fontFamily: "var(--font-gloock)" }}
              >
                This dream is now your reality.
              </h2>

              <p
                className="mt-3 text-sm leading-7"
                style={{ color: muted }}
              >
                Take a moment. You did it. Every little step,
                every bit of faith, every moment you kept going.
              </p>

              {/* Manifestation date */}
              {dream.manifested_at && (
                <div
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                  style={{
                    background: cream,
                    color: brown,
                  }}
                >
                  <CalendarDays size={15} />

                  Manifested on{" "}
                  {new Date(dream.manifested_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </div>
              )}

              <div className="mt-7">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm"
                  style={{
                    background: brown,
                    color: cream,
                  }}
                >
                  <Sparkles size={15} />
                  Dream manifested
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Saving */}
        {saving && (
          <p
            className="mt-4 text-center text-xs"
            style={{ color: muted }}
          >
            Saving your changes...
          </p>
        )}

        {/* Error */}
        {error && (
          <p
            className="mt-4 text-center text-sm"
            style={{ color: "#B65F55" }}
          >
            {error}
          </p>
        )}

        <div className="pb-10" />
      </div>
    </main>
  );
}

export default function DreamDetailsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: "#FFFCF8",
            color: "#958477",
          }}
        >
          Loading your dream...
        </div>
      }
    >
      <DreamDetailsContent />
    </Suspense>
  );
}