
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import { getDreams, type Dream } from "@/lib/dreams";

export default function ManifestationsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManifestations() {
      try {
        const allDreams = await getDreams();

        setDreams(
          allDreams.filter((dream) => dream.status === "manifested")
        );
      } catch (error) {
        console.error("Failed to load manifestations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadManifestations();
  }, []);

  const formatDate = (date?: string | null) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#faf7f0] px-5 py-10 text-[#40352c] md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/dreams"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#897968] transition hover:text-[#49382d]"
        >
          <ArrowLeft size={16} />
          Back to my dreams
        </Link>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e9dfd0] bg-[#f3eadc] px-7 py-12 md:px-14 md:py-16">

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#e6d5bd]/50 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-sm tracking-wide text-[#9b8064]">
              <Sparkles size={16} />
              <span>Your beautiful reality</span>
            </div>

            <h1 className="font-[var(--font-gloock)] text-4xl leading-tight md:text-6xl">
              Things that
              <br />
              became <span className="italic">real.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#766657] md:text-base">
              Every dream you once held in your heart, every intention
              you nurtured, every beautiful thing that found its way
              into your life. This is your reminder that things do happen.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4d3bd]">
                <Heart size={20} className="text-[#98775a]" />
              </div>

              <div>
                <p className="text-2xl font-medium">
                  {dreams.length}
                </p>
                <p className="text-xs text-[#897968]">
                  {dreams.length === 1
                    ? "dream manifested"
                    : "dreams manifested"}
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-10 hidden rotate-12 text-[#c7ad8c] md:block">
            <Sparkles size={100} strokeWidth={0.7} />
          </div>
        </section>

        {/* Collection */}
        <section className="mt-12">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#a28c75]">
                Your collection
              </p>

              <h2 className="mt-2 font-[var(--font-gloock)] text-3xl">
                The universe delivered
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-[#978572]">
              Gathering your manifestations...
            </div>
          ) : dreams.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8c9b6] px-6 py-20 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e7d9]">
                <Sparkles size={25} className="text-[#a88b6c]" />
              </div>

              <h3 className="font-[var(--font-gloock)] text-2xl">
                Your story is unfolding
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#897968]">
                Your manifested dreams will live here. Keep believing,
                keep taking little steps, and come back to celebrate
                when something becomes your reality.
              </p>

              <Link
                href="/dreams"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#574535] px-6 py-3 text-sm text-[#faf7f0] transition hover:bg-[#715b45]"
              >
                Visit my dreams
                <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {dreams.map((dream) => (
                <Link
                  key={dream.id}
                  href={`/dreams/${dream.id}`}
                  className="group overflow-hidden rounded-3xl border border-[#e9dfd0] bg-[#fffdf9] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8c7350]/10"
                >

                  {/* Card image */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#eee3d3]">

                    {dream.cover_image ? (
                      <img
                        src={dream.cover_image}
                        alt={dream.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#b39a7c]">
                        <Sparkles size={42} strokeWidth={1} />
                        <span className="text-xs tracking-widest uppercase">
                          It happened
                        </span>
                      </div>
                    )}

                    <div className="absolute right-4 top-4 rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-xs text-[#80684f] backdrop-blur-sm">
                      ✨ Manifested
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-6">

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-[#a38a70]">
                        {dream.category}
                      </span>

                      <ArrowUpRight
                        size={16}
                        className="text-[#b6a28a] transition group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>

                    <h3 className="font-[var(--font-gloock)] text-2xl leading-snug">
                      {dream.title}
                    </h3>

                    {dream.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#887867]">
                        {dream.description}
                      </p>
                    )}

                    <div className="mt-5 border-t border-[#eee5d9] pt-4">
                      <div className="flex items-center gap-2 text-xs text-[#a08b75]">
                        <CalendarDays size={14} />

                        <span>
                          {formatDate(dream.manifested_at) ??
                            "A beautiful moment"}
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}

            </div>
          )}
        </section>

        {/* Footer message */}
        {dreams.length > 0 && (
          <div className="mt-16 border-t border-[#e6dbcb] py-10 text-center">
            <Sparkles
              size={18}
              className="mx-auto mb-4 text-[#b69a79]"
            />

            <p className="font-[var(--font-gloock)] text-2xl italic text-[#806a53]">
              And there is still so much more to come.
            </p>

            <p className="mt-3 text-sm text-[#a08e7b]">
              This is only the beginning of your story.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
