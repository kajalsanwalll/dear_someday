
import { ArrowRight, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper px-6 py-8 md:px-16 md:py-12">
      {/* Header */}
      <nav className="flex items-center justify-between">
        <span className="font-heading text-xl tracking-tight">
          dear, someday.
        </span>

        <a
          href="/login"
          className="rounded-full border border-ink/20 px-5 py-2 text-sm transition hover:bg-ink hover:text-paper"
        >
          Enter my journal
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center text-center">
        <p className="handwritten mb-5 text-3xl text-muted">
          a little place for my dreams
        </p>

        <h1 className="max-w-3xl text-6xl leading-[1.1] md:text-8xl">
          dear,
          <br />
          someday.
        </h1>

        <p className="mt-8 max-w-md text-sm leading-7 text-muted md:text-base">
          A private little universe for the things I dream of,
          the things I believe in, and the things that
          eventually become mine.
        </p>

        <a
          href="/login"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-sm text-paper transition hover:opacity-80"
        >
          Enter my little world
          <ArrowRight size={16} />
        </a>

        <div className="mt-16 flex items-center gap-2 text-muted">
          <Heart size={13} />
          <span className="handwritten text-xl">
            made just for me
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted">
        a collection of dreams, intentions & little miracles
      </footer>
    </main>
  );
}
