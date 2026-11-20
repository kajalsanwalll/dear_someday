
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Sparkles,
  Bell,
  Shield,
  Heart,
  Save,
  LogOut,
  Mail,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Preferences = {
  dailyAffirmations: boolean;
  journalingPrompts: boolean;
  manifestationReminders: boolean;
  gentleNotifications: boolean;
};

const defaultPreferences: Preferences = {
  dailyAffirmations: true,
  journalingPrompts: true,
  manifestationReminders: true,
  gentleNotifications: false,
};

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/login");
        return;
      }

      const user = data.user;

      setEmail(user.email || "");
      setName(user.user_metadata?.full_name || user.user_metadata?.name || "");

      const stored = localStorage.getItem("universe-settings");

      if (stored) {
        try {
          setPreferences({
            ...defaultPreferences,
            ...JSON.parse(stored),
          });
        } catch {
          setPreferences(defaultPreferences);
        }
      }

      setLoading(false);
    }

    loadSettings();
  }, [router]);

  function togglePreference(key: keyof Preferences) {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
      },
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    localStorage.setItem(
      "universe-settings",
      JSON.stringify(preferences)
    );

    setSaved(true);
    setSaving(false);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
        <p className="text-[#958477] text-sm">
          Preparing your little universe...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-5 py-8 md:px-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[#958477] mb-3">
            <Settings size={16} />
            <span className="text-xs tracking-[0.2em] uppercase">
              Your little universe
            </span>
          </div>

          <h1 className="font-[var(--font-gloock)] text-4xl text-[#493C38]">
            Settings
          </h1>

          <p className="text-[#958477] mt-2">
            Make this space feel a little more like you.
          </p>
        </div>

        {/* Profile */}
        <section className="rounded-3xl border border-[#EAE0D6] bg-white/70 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#F5EEE7] flex items-center justify-center">
              <User size={19} className="text-[#806B5D]" />
            </div>

            <div>
              <h2 className="text-[#493C38] font-medium">
                Your account
              </h2>
              <p className="text-xs text-[#958477]">
                A little about you
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#806B5D] mb-2">
                Your name
              </label>

              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                placeholder="What should we call you?"
                className="w-full rounded-xl border border-[#EAE0D6] bg-[#FFFCF8] px-4 py-3 text-sm text-[#493C38] outline-none focus:border-[#B9A394]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#806B5D] mb-2">
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#EAE0D6] bg-[#F9F5F0] px-4 py-3">
                <Mail size={16} className="text-[#B2A092]" />

                <span className="text-sm text-[#958477]">
                  {email}
                </span>
              </div>

              <p className="text-xs text-[#B2A092] mt-2">
                Your email is connected to your account.
              </p>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="rounded-3xl border border-[#EAE0D6] bg-white/70 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#F5EEE7] flex items-center justify-center">
              <Sparkles size={19} className="text-[#806B5D]" />
            </div>

            <div>
              <h2 className="text-[#493C38] font-medium">
                Your experience
              </h2>
              <p className="text-xs text-[#958477]">
                Choose what you want to make space for
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F0E8E0]">
            {[
              {
                key: "dailyAffirmations" as const,
                icon: Heart,
                title: "Daily affirmations",
                description: "A little reminder of your worth",
              },
              {
                key: "journalingPrompts" as const,
                icon: Sparkles,
                title: "Journal prompts",
                description: "Thoughts to help you reflect",
              },
              {
                key: "manifestationReminders" as const,
                icon: Bell,
                title: "Manifestation reminders",
                description: "Gentle nudges toward your dreams",
              },
              {
                key: "gentleNotifications" as const,
                icon: Bell,
                title: "Gentle reminders",
                description: "Keep your little rituals consistent",
              },
            ].map((item) => {
              const Icon = item.icon;
              const enabled = preferences[item.key];

              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-5"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className="text-[#A28D7B] shrink-0"
                    />

                    <div>
                      <p className="text-sm text-[#493C38]">
                        {item.title}
                      </p>

                      <p className="text-xs text-[#A28D7B] mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePreference(item.key)}
                    className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${
                      enabled
                        ? "bg-[#A28D7B]"
                        : "bg-[#E8DED5]"
                    }`}
                    aria-label={`Toggle ${item.title}`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                        enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Privacy */}
        <section className="rounded-3xl border border-[#EAE0D6] bg-white/70 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#F5EEE7] flex items-center justify-center">
              <Shield size={19} className="text-[#806B5D]" />
            </div>

            <div>
              <h2 className="text-[#493C38] font-medium">
                Privacy & safety
              </h2>
              <p className="text-xs text-[#958477]">
                Your space, your thoughts, your privacy
              </p>
            </div>
          </div>

          <p className="text-sm text-[#958477] leading-6">
            Your dreams, journal entries, affirmations and
            memories are associated with your account.
            This little universe is yours to fill.
          </p>
        </section>

        {/* Save */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#806B5D] text-white py-4 hover:bg-[#6F5B4E] transition disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={17} />
              Changes saved
            </>
          ) : (
            <>
              <Save size={17} />
              {saving ? "Saving..." : "Save my changes"}
            </>
          )}
        </button>

        {/* Sign out */}
        <div className="border-t border-[#EAE0D6] pt-6">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-[#A17E75] hover:text-[#805B52] transition"
          >
            <LogOut size={16} />
            Sign out of my universe
          </button>
        </div>

        <p className="text-center text-xs text-[#C0AFA1] pb-6">
          Made with love, for the universe within you ♡
        </p>
      </div>
    </div>
  );
}
