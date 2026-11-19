
import Link from "next/link";
import { ArrowUpRight, BookHeart, Camera, Plus } from "lucide-react";

const dreams = [
  {
    title: "places I want to see",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=700",
    rotate: "-2deg",
    caption: "somewhere in Italy ♡",
  },
  {
    title: "the life I'm building",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700",
    rotate: "2deg",
    caption: "my own little corner",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-12 md:py-14">
      {/* Top note */}
      <header className="flex items-center justify-between">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">
          Thursday, November 19
        </p>

        <span className="handwritten text-xl text-muted">
          a little universe of mine ✧
        </span>
      </header>

      {/* Greeting */}
      <section className="mt-16 md:mt-20">
        <p className="handwritten text-3xl text-[#a18787]">
          welcome back, lovely
        </p>

        <h1 className="mt-3 text-5xl leading-tight md:text-7xl">
          Your dreams live
          <br />
          <span className="italic">here.</span>
        </h1>

        <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
          A little reminder that the life you&apos;re dreaming of
          is worth believing in, even on the ordinary days.
        </p>
      </section>

      {/* Today's journal */}
      <section className="mt-14">
        <div className="relative overflow-hidden rounded-2xl bg-[#e8ddd5] p-7 md:p-10">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#d4c2c9]/50 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#88736f]">
                today&apos;s little ritual
              </p>

              <h2 className="mt-3 text-3xl md:text-4xl">
                Dear Universe,
              </h2>

              <p className="handwritten mt-2 text-2xl text-[#8f737d]">
                what is on your heart today?
              </p>
            </div>

            <Link
              href="/diary/new"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#493c38] px-6 py-3 text-sm text-[#f5f0e8] transition hover:opacity-80"
            >
              Open my diary
              <BookHeart size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Vision board section */}
      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="handwritten text-xl text-muted">
              little glimpses of my future
            </p>
            <h2 className="mt-2 text-3xl">Dreaming of...</h2>
          </div>

          <Link
            href="/vision-boards"
            className="hidden items-center gap-1 text-sm text-muted hover:text-ink sm:flex"
          >
            See all <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {dreams.map((dream) => (
            <div key={dream.title} className="group">
              <div
                className="relative mx-auto max-w-[420px] bg-[#fffdf9] p-3 pb-5 shadow-[0_8px_30px_rgba(73,60,56,0.08)] transition-transform duration-300 group-hover:-translate-y-1"
                style={{ transform: `rotate(${dream.rotate})` }}
              >
                {/* Tape */}
                <div className="absolute -top-3 left-1/2 z-10 h-7 w-16 -translate-x-1/2 rotate-2 bg-[#d5c5a9]/70" />

                <img
                  src={dream.image}
                  alt={dream.title}
                  className="h-[280px] w-full object-cover"
                />

                <p className="handwritten mt-4 text-center text-2xl text-[#74635b]">
                  {dream.caption}
                </p>
              </div>

              <p className="mt-5 text-center text-sm text-muted">
                {dream.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Memories */}
      <section className="mt-16">
        <div className="rounded-2xl border border-[#493c38]/10 bg-[#faf7f1] p-7 md:p-9">
          <div className="flex items-center gap-3">
            <Camera size={18} className="text-muted" />

            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              a space for the magic
            </p>
          </div>

          <h2 className="mt-4 text-3xl">
            The things that came true.
          </h2>

          <p className="mt-3 max-w-md text-sm leading-7 text-muted">
            One day, this space will be filled with photographs
            of things that once existed only in your imagination.
          </p>

          <Link
            href="/it-came-true"
            className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4"
          >
            Visit my memory book
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* Add something */}
      <section className="mt-12 flex justify-center pb-10">
        <Link
          href="/diary/new"
          className="handwritten inline-flex items-center gap-2 text-2xl text-[#987f83] transition hover:text-ink"
        >
          <Plus size={17} />
          leave a little note for the universe
        </Link>
      </section>
    </div>
  );
}
