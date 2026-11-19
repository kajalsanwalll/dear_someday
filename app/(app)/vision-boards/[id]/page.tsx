"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Quote,
  StickyNote,
  Trash2,
  Heart,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

import {
  getBoards,
  saveBoards,
  type VisionBoard,
  type VisionBoardItem,
} from "@/lib/vision-boards";

export default function VisionBoardEditor() {
  const params = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const id = params.id as string;

  const [board, setBoard] = useState<VisionBoard | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [modal, setModal] = useState<"quote" | "note" | null>(null);
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    const boards = getBoards();
    const found = boards.find((b) => b.id === id);

    setBoard(found || null);
    setLoaded(true);
  }, [id]);

  function updateBoard(updated: VisionBoard) {
    setBoard(updated);

    const boards = getBoards();
    const next = boards.map((b) => (b.id === updated.id ? updated : b));

    saveBoards(next);
  }

  function randomPosition() {
    return {
      x: Math.floor(Math.random() * 60) + 5,
      y: Math.floor(Math.random() * 55) + 5,
    };
  }

  function addItem(item: VisionBoardItem) {
    if (!board) return;

    updateBoard({
      ...board,
      items: [...board.items, item],
    });
  }

  function deleteItem(itemId: string) {
    if (!board) return;

    updateBoard({
      ...board,
      items: board.items.filter((item) => item.id !== itemId),
    });
  }

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        image.src = reader.result as string;
      };

      reader.onerror = reject;

      image.onload = () => {
        const maxSize = 1000;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleImages(files: FileList | null) {
    if (!files || !board) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;

      try {
        const src = await compressImage(file);
        const position = randomPosition();

        addItem({
          id: crypto.randomUUID(),
          type: "image",
          content: src,
          caption: "",
          rotation: Math.random() * 8 - 4,
          ...position,
        });
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function handleTextItem() {
    if (!text.trim() || !board) return;

    const position = randomPosition();

    addItem({
      id: crypto.randomUUID(),
      type: modal!,
      content: text.trim(),
      caption: caption.trim(),
      rotation: Math.random() * 6 - 3,
      ...position,
    });

    setText("");
    setCaption("");
    setModal(null);
  }

  if (!loaded) return null;

  if (!board) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Heart className="mb-4 text-[#B4A18F]" size={30} />

        <h1 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
          This board wandered away...
        </h1>

        <button
          onClick={() => router.push("/vision-boards")}
          className="mt-5 text-sm text-[#958477] underline underline-offset-4"
        >
          Back to your boards
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">

      {/* Top navigation */}
      <div className="mb-7 flex items-center justify-between">
        <button
          onClick={() => router.push("/vision-boards")}
          className="flex items-center gap-2 text-sm text-[#958477] transition hover:text-[#493C38]"
        >
          <ArrowLeft size={16} />
          All boards
        </button>

        <span className="text-xs text-[#B4A18F]">
          {board.items.length} collected ♡
        </span>
      </div>

      {/* Board heading */}
      <div className="mb-8">
        <h1 className="font-[var(--font-gloock)] text-3xl text-[#493C38] md:text-4xl">
          {board.title}
        </h1>

        {board.description && (
          <p className="mt-2 text-sm text-[#958477]">
            {board.description}
          </p>
        )}

        <p className="mt-2 text-xs text-[#B4A18F]">
          {board.category}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap gap-2">

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-full bg-[#493C38] px-4 py-2.5 text-sm text-white transition hover:bg-[#66534B]"
        >
          <ImagePlus size={16} />
          Add photos
        </button>

        <button
          onClick={() => setModal("quote")}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-[#FFFCF8] px-4 py-2.5 text-sm text-[#493C38] transition hover:bg-[#F5F0E8]"
        >
          <Quote size={15} />
          Add quote
        </button>

        <button
          onClick={() => setModal("note")}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-[#FFFCF8] px-4 py-2.5 text-sm text-[#493C38] transition hover:bg-[#F5F0E8]"
        >
          <StickyNote size={15} />
          Add a note
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleImages(e.target.files)}
        />
      </div>

      {/* Canvas */}
      <section
        className="relative min-h-[700px] overflow-hidden rounded-2xl border border-[#E5DAD0] shadow-sm md:min-h-[850px]"
        style={{
          backgroundColor: board.coverColor,
          backgroundImage:
            "radial-gradient(rgba(73,60,56,0.08) 0.7px, transparent 0.7px)",
          backgroundSize: "18px 18px",
        }}
      >
        {/* Canvas empty state */}
        {board.items.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

            <div className="mb-5 rounded-full bg-white/40 p-5">
              <Sparkles size={28} className="text-[#493C38]/50" />
            </div>

            <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
              Your dreams go here
            </h2>

            <p className="mt-3 max-w-xs text-sm leading-7 text-[#493C38]/60">
              Add photos of the things you want, little reminders,
              and words that feel like your future.
            </p>

            <button
              onClick={() => fileRef.current?.click()}
              className="mt-6 rounded-full bg-white/60 px-5 py-3 text-sm text-[#493C38] transition hover:bg-white/80"
            >
              Start collecting ♡
            </button>
          </div>
        )}

        {/* Board items */}
        {board.items.map((item) => (
          <div
            key={item.id}
            className="group absolute"
            style={{
              left: `${item.x ?? 10}%`,
              top: `${item.y ?? 10}%`,
              transform: `rotate(${item.rotation}deg)`,
              zIndex: 1,
            }}
          >
            {/* Delete button */}
            <button
              onClick={() => deleteItem(item.id)}
              className="absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#493C38] text-white opacity-0 shadow transition group-hover:opacity-100"
              aria-label="Remove item"
            >
              <X size={13} />
            </button>

            {/* Image polaroid */}
            {item.type === "image" && (
              <div className="w-[160px] bg-[#FFFCF8] p-2 pb-4 shadow-lg transition duration-200 group-hover:scale-[1.03] sm:w-[190px]">
                <img
                  src={item.content}
                  alt={item.caption || "Vision board image"}
                  className="aspect-[4/5] w-full object-cover"
                />

                <p className="mt-2 min-h-[20px] text-center font-[var(--font-caveat)] text-lg text-[#493C38]">
                  {item.caption || " "}
                </p>

                <button
                  onClick={() => {
                    const newCaption = prompt(
                      "Write a little caption ♡",
                      item.caption || ""
                    );

                    if (newCaption !== null) {
                      updateBoard({
                        ...board,
                        items: board.items.map((i) =>
                          i.id === item.id
                            ? { ...i, caption: newCaption }
                            : i
                        ),
                      });
                    }
                  }}
                  className="mt-1 w-full text-center text-[10px] text-[#B4A18F] opacity-0 transition group-hover:opacity-100"
                >
                  Add caption
                </button>
              </div>
            )}

            {/* Quote */}
            {item.type === "quote" && (
              <div className="max-w-[230px] bg-[#FFFCF8]/85 p-5 shadow-md sm:max-w-[270px]">
                <Quote
                  size={17}
                  className="mb-3 text-[#B4A18F]"
                />

                <p className="font-[var(--font-gloock)] text-lg leading-relaxed text-[#493C38]">
                  {item.content}
                </p>

                {item.caption && (
                  <p className="mt-3 font-[var(--font-caveat)] text-lg text-[#958477]">
                    — {item.caption}
                  </p>
                )}
              </div>
            )}

            {/* Note */}
            {item.type === "note" && (
              <div className="w-[190px] bg-[#F7E9B9] p-5 shadow-md sm:w-[220px]">
                <p className="whitespace-pre-wrap font-[var(--font-caveat)] text-xl leading-relaxed text-[#493C38]">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </section>

      <p className="mt-5 text-center font-[var(--font-caveat)] text-lg text-[#958477]">
        a reminder of the life you&apos;re creating ♡
      </p>

      {/* Quote / Note modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#493C38]/30 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#FFFCF8] p-7 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
                {modal === "quote" ? "Words to keep ♡" : "A little reminder"}
              </h2>

              <button
                onClick={() => setModal(null)}
                className="rounded-full p-2 text-[#958477] hover:bg-[#F5F0E8]"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                modal === "quote"
                  ? "Write the words you want to remember..."
                  : "Leave yourself a little note..."
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm leading-7 text-[#493C38] outline-none focus:border-[#B4A18F]"
              autoFocus
            />

            {modal === "quote" && (
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Who said it? (optional)"
                className="mt-3 w-full rounded-xl border border-[#E5DAD0] bg-white px-4 py-3 text-sm outline-none focus:border-[#B4A18F]"
              />
            )}

            <button
              onClick={handleTextItem}
              disabled={!text.trim()}
              className="mt-4 w-full rounded-full bg-[#493C38] py-3 text-sm text-white transition hover:bg-[#66534B] disabled:opacity-40"
            >
              Pin it to my board ♡
            </button>
          </div>
        </div>
      )}
    </main>
  );
}