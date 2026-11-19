"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Heart, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);
  setError("");
  setMessage("");

  try {
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        window.location.href = "/home";
      } else {
        setMessage("Your account is created! Check your email to confirm ♡");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error("Login succeeded, but no session was created.");
      }

      // Force a fresh server request so middleware sees the session
      window.location.href = "/home";
    }
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Try again ♡"
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] px-5 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-[#E9DDD2] p-4">
            <Heart size={23} className="text-[#B58D88]" />
          </div>

          <h1 className="font-[var(--font-gloock)] text-4xl text-[#493C38]">
            dear, someday.
          </h1>

          <p className="mt-3 font-[var(--font-caveat)] text-xl text-[#958477]">
            a little space for the life you're dreaming of ♡
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-[#E5DAD0] bg-[#FFFCF8] p-7 shadow-[0_12px_40px_rgba(73,60,56,0.06)] sm:p-9">
          {/* Toggle */}
          <div className="mb-7 grid grid-cols-2 rounded-full bg-[#F5F0E8] p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setError("");
                setMessage("");
              }}
              className={`rounded-full py-2.5 text-sm transition ${
                !isSignup
                  ? "bg-[#FFFCF8] text-[#493C38] shadow-sm"
                  : "text-[#958477]"
              }`}
            >
              Welcome back
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setError("");
                setMessage("");
              }}
              className={`rounded-full py-2.5 text-sm transition ${
                isSignup
                  ? "bg-[#FFFCF8] text-[#493C38] shadow-sm"
                  : "text-[#958477]"
              }`}
            >
              Create account
            </button>
          </div>

          <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
            {isSignup ? "Your someday starts here." : "You've been missed."}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#958477]">
            {isSignup
              ? "Create a little home for your dreams, thoughts and memories."
              : "Come back to your little corner of the universe."}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  What should we call you?
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none transition placeholder:text-[#B4A18F]/70 focus:border-[#B4A18F]"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs text-[#958477]">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none transition placeholder:text-[#B4A18F]/70 focus:border-[#B4A18F]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#958477]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none transition placeholder:text-[#B4A18F]/70 focus:border-[#B4A18F]"
              />
            </div>

            {/* Feedback */}
            {error && (
              <div className="rounded-xl bg-[#F4E3E0] px-4 py-3 text-sm text-[#9B5C55]">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-[#E8EDE3] px-4 py-3 text-sm text-[#68785D]">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#493C38] py-3.5 text-sm text-white transition hover:bg-[#66534B] disabled:opacity-60"
            >
              {loading ? (
                "One moment..."
              ) : isSignup ? (
                <>
                  <Sparkles size={16} />
                  Create my little space
                </>
              ) : (
                <>
                  <Heart size={15} />
                  Enter my space
                </>
              )}
            </button>
          </form>

          {/* Switch */}
          <p className="mt-6 text-center text-sm text-[#958477]">
            {isSignup ? "Already have a space?" : "New around here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setMessage("");
              }}
              className="text-[#493C38] underline underline-offset-4"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center font-[var(--font-caveat)] text-lg text-[#B4A18F]">
          little dreams deserve a place to live ♡
        </p>
      </div>
    </main>
  );
}