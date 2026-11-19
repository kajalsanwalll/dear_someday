"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Sparkles,
  ArrowUpRight,
  Heart,
  Trash2,
} from "lucide-react";
import {
  getBoards,
  saveBoards,
  createBoard,
  type VisionBoard,
} from "@/lib/vision-boards";

const covers = [
  "#E8DCD1",
  "#D8D5E5",
  "#E8D6D5",
  "#DCE3D5",
  "#E9E1C8",
  "#D9E3E8",
];

const categories = [
  "My dream life",
  "Career",
  "Love",
  "Travel",
  "Home",
  "Financial freedom",
  "Personal growth",
  "Other",
];

export default function VisionBoardsPage() {
  const router = useRouter();

  const [boards, setBoards] = useState<VisionBoard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("My dream life");
  const [coverColor, setCoverColor] = useState(covers[0]);

  useEffect(() => {
    setBoards(getBoards());
    setLoaded(true);
  }, []);

  function handleCreate() {
    if (!title.trim()) return;

    const board = createBoard(
      title.trim(),
      description.trim(),
      category,
      coverColor
    );

    const updated = [board, ...boards];

    setBoards(updated);
    saveBoards(updated);

    setShowCreate(false);
    setTitle("");
    setDescription("");

    router.push(`/vision-boards/${board.id}`);
  }

  function handleDelete(id: string) {
    const updated = boards.filter((board) => board.id !== id);
    setBoards(updated);
    saveBoards(updated);
  }

  if (!loaded) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">

      {/* Header */}
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-[#958477]">
            Collect the life you&apos;re dreaming of ♡
          </p>

          <h1 className="font-[var(--font-gloock)] text-4xl text-[#493C38]">
            Vision boards
          </h1>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-[#493C38] px-5 py-3 text-sm text-[#FFFCF8] transition hover:bg-[#66534B]"
        >
          <Plus size={16} />
          Create board
        </button>
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#D8CBBE] bg-[#FFFCF8] px-6 py-20 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
            <Sparkles className="text-[#958477]" size={26} />
          </div>

          <h2 className="mb-2 font-[var(--font-gloock)] text-2xl text-[#493C38]">
            A little space for your someday
          </h2>

          <p className="mx-auto mb-6 max-w-sm text-sm leading-7 text-[#958477]">
            Gather the places, feelings, people and moments
            you&apos;re calling into your life.
          </p>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-full border border-[#D8CBBE] px-6 py-3 text-sm text-[#493C38] transition hover:bg-[#F5F0E8]"
          >
            Create your first board ♡
          </button>
        </div>
      )}

      {/* Board grid */}
      {boards.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative cursor-pointer"
            >
              <div
                onClick={() =>
                  router.push(`/vision-boards/${board.id}`)
                }
                className="relative overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1"
                style={{ backgroundColor: board.coverColor }}
              >
                <div className="flex aspect-[4/3] flex-col items-center justify-center p-8 text-center">

                  <Heart
                    size={20}
                    className="mb-4 text-[#493C38]/50"
                  />

                  <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
                    {board.title}
                  </h2>

                  {board.description && (
                    <p className="mt-2 max-w-[220px] text-sm text-[#493C38]/70">
                      {board.description}
                    </p>
                  )}

                  <span className="mt-5 rounded-full bg-white/40 px-3 py-1 text-xs text-[#493C38]/70">
                    {board.category}
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="absolute right-4 top-4 opacity-0 transition group-hover:opacity-60"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm text-[#493C38]">
                    {board.title}
                  </p>

                  <p className="mt-1 text-xs text-[#958477]">
                    {board.items.length} little things collected
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (confirm("Delete this vision board?")) {
                      handleDelete(board.id);
                    }
                  }}
                  className="rounded-full p-2 text-[#B4A18F] opacity-0 transition hover:bg-[#E8DCD1] hover:text-[#493C38] group-hover:opacity-100"
                  aria-label="Delete board"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Create another card */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8CBBE] text-[#958477] transition hover:bg-[#FFFCF8]"
          >
            <Plus size={24} />
            <span className="mt-3 text-sm">A new someday...</span>
          </button>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#493C38]/30 p-4 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#FFFCF8] p-7 shadow-xl"
          >
            <p className="mb-2 text-xs tracking-widest text-[#958477] uppercase">
              A new little dream
            </p>

            <h2 className="mb-6 font-[var(--font-gloock)] text-2xl text-[#493C38]">
              Create your vision board
            </h2>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  What are we dreaming of?
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My dream life in New York"
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  A little description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how this dream feels..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#958477]">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm text-[#493C38] outline-none"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-3 block text-xs text-[#958477]">
                  Choose your paper
                </label>

                <div className="flex gap-3">
                  {covers.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCoverColor(color)}
                      className={`h-9 w-9 rounded-full transition ${
                        coverColor === color
                          ? "ring-2 ring-[#493C38] ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="mt-3 w-full rounded-full bg-[#493C38] py-3 text-sm text-white transition hover:bg-[#66534B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create my board ♡
              </button>

              <button
                onClick={() => setShowCreate(false)}
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