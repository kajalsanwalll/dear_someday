
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Quote,
  StickyNote,
  Heart,
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
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-16 text-[#958477]">
          Opening your little dream space... ♡
        </div>
      }
    >
      <VisionBoardEditorContent />
    </Suspense>
  );
}

function VisionBoardEditorContent() {
  const params = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const id = params.id as string;

  const [board, setBoard] = useState<VisionBoard | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState<"quote" | "note" | null>(null);
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");

  // Load board from Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      try {
        setError("");

        const boards = await getBoards();

        const found = boards.find((b) => b.id === id);

        if (!cancelled) {
          setBoard(found || null);
        }
      } catch (err) {
        console.error("Failed to load vision board:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load this vision board."
          );
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Update board and persist changes
  async function updateBoard(updated: VisionBoard) {
    if (!board || saving) return;

    const previous = board;

    setSaving(true);
    setError("");

    // Optimistic update
    setBoard(updated);

    try {
      // Save only this board. Never delete unrelated boards.
      await saveBoards([updated]);
    } catch (err) {
      console.error("Failed to save vision board:", err);

      // Restore previous state if saving fails.
      setBoard(previous);

      setError(
        err instanceof Error
          ? err.message
          : "Your changes couldn't be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Generate scrapbook-style positions
  function randomPosition(existingItems: VisionBoardItem[] = []) {
    const slots = [
      { x: 5, y: 5 },
      { x: 36, y: 7 },
      { x: 67, y: 5 },

      { x: 8, y: 29 },
      { x: 39, y: 31 },
      { x: 70, y: 28 },

      { x: 4, y: 53 },
      { x: 35, y: 55 },
      { x: 66, y: 52 },

      { x: 14, y: 75 },
      { x: 45, y: 76 },
      { x: 72, y: 73 },
    ];

    const available = slots.filter((slot) => {
      return !existingItems.some((item) => {
        const itemX = item.x ?? 10;
        const itemY = item.y ?? 10;

        return (
          Math.abs(itemX - slot.x) < 18 &&
          Math.abs(itemY - slot.y) < 16
        );
      });
    });

    const pool = available.length > 0 ? available : slots;

    const position = pool[Math.floor(Math.random() * pool.length)];

    return {
      x: Math.min(
        82,
        Math.max(3, position.x + (Math.random() * 6 - 3))
      ),
      y: Math.min(
        82,
        Math.max(3, position.y + (Math.random() * 5 - 2.5))
      ),
    };
  }

  const columns = 4;
  const rowSpacing = 360;

  function getCanvasHeight(itemCount: number) {
    const rows = Math.max(1, Math.ceil(itemCount / columns));
    return Math.max(680, rows * rowSpacing + 100);
  }

  // Arrange items across the canvas
  async function arrangeBoard() {
    if (!board || board.items.length < 2 || saving) return;

    const height = getCanvasHeight(board.items.length);
    const xPositions = [5, 27, 51, 75];

    const arrangedItems = board.items.map((item, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;

      const stagger = [0, 35, 10, 45][column];

      return {
        ...item,
        x: xPositions[column] + (Math.random() * 3 - 1.5),
        y: ((row * rowSpacing + stagger + 30) / height) * 100,
        rotation: Math.random() * 6 - 3,
      };
    });

    await updateBoard({
      ...board,
      items: arrangedItems,
    });
  }

  // Add an item
  async function addItem(item: VisionBoardItem) {
    if (!board || saving) return;

    await updateBoard({
      ...board,
      items: [...board.items, item],
    });
  }

  // Delete an item
  async function deleteItem(itemId: string) {
    if (!board || saving) return;

    await updateBoard({
      ...board,
      items: board.items.filter((item) => item.id !== itemId),
    });
  }

  // Compress uploaded images
  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        image.src = reader.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Could not read the image."));
      };

      image.onerror = () => {
        reject(new Error("Could not process the image."));
      };

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
          reject(new Error("Could not process image."));
          return;
        }

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      reader.readAsDataURL(file);
    });
  }

  // Upload multiple images and save them together
  async function handleImages(files: FileList | null) {
    if (!files || !board || saving) return;

    setError("");

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) return;

    setSaving(true);

    const previous = board;
    let updatedBoard = board;

    try {
      for (const file of selectedFiles) {
        const src = await compressImage(file);

        const position = randomPosition(updatedBoard.items);

        const newItem: VisionBoardItem = {
          id: crypto.randomUUID(),
          type: "image",
          content: src,
          caption: "",
          rotation: Math.random() * 8 - 4,
          ...position,
        };

        updatedBoard = {
          ...updatedBoard,
          items: [...updatedBoard.items, newItem],
        };
      }

      setBoard(updatedBoard);

      await saveBoards([updatedBoard]);
    } catch (err) {
      console.error("Image upload failed:", err);

      setBoard(previous);

      setError(
        err instanceof Error
          ? err.message
          : "Your images couldn't be saved."
      );
    } finally {
      setSaving(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  // Add quote or note
  async function handleTextItem() {
    if (!text.trim() || !board || saving || !modal) return;

    const position = randomPosition(board.items);

    const newItem: VisionBoardItem = {
      id: crypto.randomUUID(),
      type: modal,
      content: text.trim(),
      caption: caption.trim(),
      rotation: Math.random() * 6 - 3,
      ...position,
    };

    await addItem(newItem);

    setText("");
    setCaption("");
    setModal(null);
  }

  // Update image caption
  async function editCaption(item: VisionBoardItem) {
    if (!board || saving) return;

    const newCaption = prompt(
      "Write a little caption ♡",
      item.caption || ""
    );

    if (newCaption === null) return;

    await updateBoard({
      ...board,
      items: board.items.map((i) =>
        i.id === item.id
          ? { ...i, caption: newCaption }
          : i
      ),
    });
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-[#958477]">
        Opening your little dream space... ♡
      </div>
    );
  }

  if (error && !board) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <Heart className="mb-4 text-[#B4A18F]" size={30} />

        <h1 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
          Couldn't open your dream space
        </h1>

        <p className="mt-3 text-sm text-[#958477]">
          {error}
        </p>

        <button
          onClick={() => router.push("/vision-boards")}
          className="mt-5 text-sm text-[#958477] underline underline-offset-4"
        >
          Back to your boards
        </button>
      </div>
    );
  }

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

      {/* Save status */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[#958477]">
          {saving ? "Saving your dreams..." : "Your little space ♡"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl bg-[#F4E3E0] px-4 py-3 text-sm text-[#9B5C55]">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap gap-2">

        <button
          onClick={() => fileRef.current?.click()}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-[#493C38] px-4 py-2.5 text-sm text-white transition hover:bg-[#66534B] disabled:opacity-50"
        >
          <ImagePlus size={16} />
          Add photos
        </button>

        <button
          onClick={() => setModal("quote")}
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-[#FFFCF8] px-4 py-2.5 text-sm text-[#493C38] transition hover:bg-[#F5F0E8] disabled:opacity-50"
        >
          <Quote size={15} />
          Add quote
        </button>

        <button
          onClick={() => setModal("note")}
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-[#FFFCF8] px-4 py-2.5 text-sm text-[#493C38] transition hover:bg-[#F5F0E8] disabled:opacity-50"
        >
          <StickyNote size={15} />
          Add a note
        </button>

        <button
          onClick={arrangeBoard}
          disabled={board.items.length < 2 || saving}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-[#FFFCF8] px-4 py-2.5 text-sm text-[#493C38] transition hover:bg-[#F5F0E8] disabled:opacity-40"
        >
          <Sparkles size={15} />
          Arrange my board
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
        className="relative overflow-hidden rounded-2xl border border-[#E5DAD0] shadow-sm transition-all duration-500"
        style={{
          height: `${getCanvasHeight(board.items.length)}px`,
          backgroundColor: board.coverColor,
          backgroundImage:
            "radial-gradient(rgba(73,60,56,0.08) 0.6px, transparent 0.6px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Empty state */}
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
              disabled={saving}
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
              disabled={saving}
              className="absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#493C38] text-white opacity-0 shadow transition group-hover:opacity-100 disabled:opacity-40"
              aria-label="Remove item"
            >
              <X size={13} />
            </button>

            {/* Image polaroid */}
            {item.type === "image" && (
              <div className="w-[190px] bg-[#FFFCF8] p-3 pb-5 shadow-lg transition duration-200 group-hover:scale-[1.03] sm:w-[240px]">
                <img
                  src={item.content}
                  alt={item.caption || "Vision board image"}
                  className="aspect-[3/4] w-full object-cover"
                />

                <p className="mt-2 min-h-[20px] text-center font-[var(--font-caveat)] text-lg text-[#493C38]">
                  {item.caption || " "}
                </p>

                <button
                  onClick={() => editCaption(item)}
                  disabled={saving}
                  className="mt-1 w-full text-center text-[10px] text-[#B4A18F] opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                >
                  Add caption
                </button>
              </div>
            )}

            {/* Quote */}
            {item.type === "quote" && (
              <div className="max-w-[200px] bg-[#FFFCF8]/90 p-4 shadow-md sm:max-w-[225px]">
                <Quote
                  size={17}
                  className="mb-3 text-[#B4A18F]"
                />

                <p className="font-[var(--font-gloock)] text-base leading-relaxed text-[#493C38]">
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
              <div className="w-[165px] bg-[#F7E9B9] p-4 shadow-md sm:w-[190px]">
                <p className="whitespace-pre-wrap font-[var(--font-caveat)] text-lg leading-relaxed text-[#493C38]">
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
          onClick={() => !saving && setModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#FFFCF8] p-7 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[var(--font-gloock)] text-2xl text-[#493C38]">
                {modal === "quote"
                  ? "Words to keep ♡"
                  : "A little reminder"}
              </h2>

              <button
                onClick={() => setModal(null)}
                disabled={saving}
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
              disabled={!text.trim() || saving}
              className="mt-4 w-full rounded-full bg-[#493C38] py-3 text-sm text-white transition hover:bg-[#66534B] disabled:opacity-40"
            >
              {saving ? "Saving..." : "Pin it to my board ♡"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
