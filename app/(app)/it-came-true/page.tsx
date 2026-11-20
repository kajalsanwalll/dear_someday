
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Search,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  Stars,
} from "lucide-react";

import { getDreams, type Dream } from "@/lib/dreams";

export default function ItCameTruePage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const allDreams = await getDreams();

        setDreams(
          allDreams.filter((dream) => dream.status === "manifested")
        );
      } catch (error) {
        console.error("Could not load manifested dreams:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredDreams = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return dreams;

    return dreams.filter(
      (dream) =>
        dream.title.toLowerCase().includes(query) ||
        dream.description?.toLowerCase().includes(query) ||
        dream.category?.toLowerCase().includes(query)
    );
  }, [dreams, search]);

  const formatDate = (date?: string | null) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#faf7f0] px-5 py-8 text-[#493b30] md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#a28a72]">
            <Stars size={17} />
            <span className="text-xs uppercase tracking-[0.2em]">
              A collection of answered wishes
            </span>
          </div>

          <h1 className="mt-5 font-[var(--font-gloock)] text-4xl leading-tight md:text-6xl">
            It came <span className="italic">true.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#887765] md:text-base">
            A little reminder of all the things you once wished for,
            dreamed about, and now get to call your reality.
          </p>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c6] bg-[#f1e6d7] px-7 py-10 md:px-12 md:py-14">

          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#ddc7a9]/40 blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#e9d8c4]/50 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e4d2bc]">
              <Heart size={21} className="text-[#98775a]" />
            </div>

            <h2 className="font-[var(--font-gloock)] text-3xl leading-snug md:text-4xl">
              Remember when
              <br />
              <span className="italic">you wished for this?</span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#806d59]">
              You have made it through days when this life was only
              something you imagined. Never forget to pause and
              appreciate the things that found their way to you.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e3d1bb]">
                <Sparkles size={22} className="text-[#9b7e5c]" />
              </div>

              <div>
                <p className="font-[var(--font-gloock)] text-3xl">
                  {dreams.length}
                </p>

                <p className="text-xs text-[#88745d]">
                  {dreams.length === 1
                    ? "dream brought to life"
                    : "dreams brought to life"}
                </p>
              </div>
            </div>
          </div>

          <Sparkles
            size={85}
            strokeWidth={0.8}
            className="absolute bottom-8 right-10 hidden text-[#c4a783] md:block"
          />
        </section>

        {/* Collection */}
        <section className="mt-12">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#a28c75]">
                Your memories
              </p>

              <h2 className="mt-2 font-[var(--font-gloock)] text-3xl">
                The things that came true
              </h2>
            </div>

            {dreams.length > 0 && (
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a38c76]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a memory..."
                  className="w-full rounded-full border border-[#e5d8c7] bg-[#fffdf9] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#c4a783]"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Sparkles
                size={22}
                className="mx-auto mb-4 animate-pulse text-[#b49a7b]"
              />

              <p className="text-sm text-[#978572]">
                Gathering your beautiful memories...
              </p>
            </div>
          ) : dreams.length === 0 ? (
            /* Empty state */
            <div className="mt-7 rounded-[2rem] border border-dashed border-[#d9c9b6] bg-[#fcfaf6] px-6 py-16 text-center">

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0e6d8]">
                <Sparkles
                  size={30}
                  strokeWidth={1.2}
                  className="text-[#ad9070]"
                />
              </div>

              <h3 className="font-[var(--font-gloock)] text-2xl">
                Your story is still unfolding
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#8d7b68]">
                One day, you'll look back at the things you wished
                for and realize some of them became your everyday
                life. When a dream comes true, mark it as manifested
                in My Dreams, and it will find its place here.
              </p>

              <Link
                href="/dreams"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#574535] px-6 py-3 text-sm text-[#faf7f0] transition hover:bg-[#715b45]"
              >
                Visit my dreams
                <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : filteredDreams.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-[#e8ddce] bg-[#fffdf9] py-16 text-center">
              <Search
                size={22}
                className="mx-auto mb-4 text-[#b29a80]"
              />

              <p className="font-[var(--font-gloock)] text-xl">
                No memories found
              </p>

              <p className="mt-2 text-sm text-[#958370]">
                Try searching for something else.
              </p>
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredDreams.map((dream) => (
                <Link
                  key={dream.id}
                  href={`/dreams/${dream.id}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-[#e8ddce] bg-[#fffdf9] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8c7350]/10"
                >

                  {/* Cover */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#eee3d3]">

                    {dream.cover_image ? (
                      <img
                        src={dream.cover_image}
                        alt={dream.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#b39a7c]">
                        <Sparkles size={40} strokeWidth={1} />

                        <span className="text-xs uppercase tracking-[0.18em]">
                          A wish fulfilled
                        </span>
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-[#fffdf0]/85 px-3 py-1.5 text-xs text-[#81684e] backdrop-blur-sm">
                      ✨ It came true
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">

                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.16em] text-[#a38a72]">
                        {dream.category}
                      </span>

                      <ArrowUpRight
                        size={16}
                        className="text-[#b6a28a] transition group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>

                    <h3 className="mt-3 font-[var(--font-gloock)] text-2xl leading-snug">
                      {dream.title}
                    </h3>

                    {dream.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#887867]">
                        {dream.description}
                      </p>
                    )}

                    <div className="mt-5 border-t border-[#eee5d9] pt-4">
                      <div className="flex items-center gap-2 text-xs text-[#a08b75]">
                        <CalendarDays size={14} />

                        <span>
                          {formatDate(dream.manifested_at) ??
                            "A moment worth remembering"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#987b5d]">
                      <BookOpen size={14} />
                      Revisit this dream
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          )}
        </section>

        {/* Footer */}
        {dreams.length > 0 && (
          <div className="mt-16 border-t border-[#e6dbcb] py-10 text-center">
            <Sparkles
              size={18}
              className="mx-auto mb-4 text-[#b69a79]"
            />

            <p className="font-[var(--font-gloock)] text-2xl italic text-[#806a53]">
              You once dreamed of this life.
            </p>

            <p className="mt-3 text-sm text-[#a08e7b]">
              And look at you, living it.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
