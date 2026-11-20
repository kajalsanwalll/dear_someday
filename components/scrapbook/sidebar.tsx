"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  House,
  BookHeart,
  Images,
  Sparkles,
  Camera,
  Heart,
  Settings,
  Plus,
} from "lucide-react";

const navigation = [
  { label: "My little world", href: "/home", icon: House },
  { label: "My diary", href: "/diary", icon: BookHeart },
  { label: "Vision boards", href: "/vision-boards", icon: Images },
  { label: "My dreams", href: "/dreams", icon: Sparkles },
  { label: "It came true", href: "/it-came-true", icon: Camera },
  { label: "Affirmations", href: "/affirmations", icon: Heart },
  { label: "Manifestations",href: "/manifestations",icon: Sparkles},
  {
  label: "Journal",
  href: "/journal",
  icon: BookOpen,
},
];

export default function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-[250px] flex-col border-r border-[#493c38]/10 bg-[#eee7dc] px-6 py-8" />
      }
    >
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-[250px] flex-col border-r border-[#493c38]/10 bg-[#eee7dc] px-6 py-8">

      {/* Brand */}
      <Link href="/home" className="mb-12 block">
        <h1 className="font-heading text-2xl tracking-tight">
          dear, someday.
        </h1>

        <p className="handwritten mt-1 text-lg text-muted">
          a little place for my dreams
        </p>
      </Link>

      {/* Navigation */}
      <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted">
        your little universe
      </p>

      <nav className="flex flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/home" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                active
                  ? "bg-[#dcd0c4] text-ink"
                  : "text-[#82756b] hover:bg-[#e5dbd0] hover:text-ink"
              }`}
            >
              <Icon size={17} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick create */}
      <Link
        href="/diary/new"
        className="mt-8 flex items-center justify-center gap-2 rounded-full border border-[#493c38]/20 px-4 py-3 text-sm transition hover:bg-[#e5dbd0]"
      >
        <Plus size={16} />
        Write something
      </Link>

      {/* Bottom */}
      <div className="mt-auto">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
            pathname === "/settings"
              ? "bg-[#dcd0c4] text-ink"
              : "text-muted hover:bg-[#e5dbd0]"
          }`}
        >
          <Settings size={17} />
          Settings
        </Link>

        <div className="mt-5 border-t border-[#493c38]/10 pt-5">
          <p className="handwritten text-xl text-muted">
            with love, for me ♡
          </p>
        </div>
      </div>
    </aside>
  );
}