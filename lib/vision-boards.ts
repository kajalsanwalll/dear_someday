export type VisionBoard = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverColor: string;
  createdAt: string;
  items: VisionBoardItem[];
};

export type VisionBoardItem = {
  id: string;
  type: "image" | "quote" | "note";
  content: string;
  caption?: string;
  rotation: number;
  x?: number;
  y?: number;
};

const STORAGE_KEY = "dear-someday-vision-boards";

export function getBoards(): VisionBoard[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBoards(boards: VisionBoard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

export function createBoard(
  title: string,
  description: string,
  category: string,
  coverColor: string
): VisionBoard {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    category,
    coverColor,
    createdAt: new Date().toISOString(),
    items: [],
  };
}