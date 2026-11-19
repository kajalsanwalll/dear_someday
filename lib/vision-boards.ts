import { supabase } from "@/lib/supabase/client";

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
const MIGRATION_KEY = "dear-someday-vision-boards-migrated";

type DatabaseBoard = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  cover_color: string;
  created_at: string;
  items: VisionBoardItem[];
};

function fromDatabase(board: DatabaseBoard): VisionBoard {
  return {
    id: board.id,
    title: board.title,
    description: board.description ?? "",
    category: board.category ?? "Other",
    coverColor: board.cover_color,
    createdAt: board.created_at,
    items: board.items ?? [],
  };
}

function toDatabase(
  board: VisionBoard,
  userId: string
) {
  return {
    id: board.id,
    user_id: userId,
    title: board.title,
    description: board.description,
    category: board.category,
    cover_color: board.coverColor,
    created_at: board.createdAt,
    items: board.items,
  };
}

/**
 * Migrate existing localStorage boards into Supabase.
 * Runs only once per logged-in user.
 */
async function migrateLocalBoards(userId: string) {
  if (typeof window === "undefined") return;

  const migrationKey = `${MIGRATION_KEY}-${userId}`;

  if (localStorage.getItem(migrationKey)) return;

  const legacyBoards = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  ) as VisionBoard[];

  if (legacyBoards.length > 0) {
    const { error } = await supabase
      .from("vision_boards")
      .upsert(
        legacyBoards.map((board) => toDatabase(board, userId)),
        { onConflict: "id" }
      );

    if (error) throw error;
  }

  // Mark as migrated only after a successful migration
  localStorage.setItem(migrationKey, "true");
}

/**
 * Get all vision boards belonging to the current user.
 */
export async function getBoards(): Promise<VisionBoard[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return [];

  await migrateLocalBoards(user.id);

  const { data, error } = await supabase
    .from("vision_boards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as DatabaseBoard[]).map(fromDatabase);
}

/**
 * Save the user's boards to Supabase.
 */
export async function saveBoards(boards: VisionBoard[]) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to save vision boards.");

  if (boards.length > 0) {
    const { error } = await supabase
      .from("vision_boards")
      .upsert(
        boards.map((board) => toDatabase(board, user.id)),
        { onConflict: "id" }
      );

    if (error) throw error;
  }

  // Remove boards that no longer exist in the provided list.
  let deleteQuery = supabase
    .from("vision_boards")
    .delete()
    .eq("user_id", user.id);

  if (boards.length > 0) {
    const boardIds = boards.map((board) => board.id);

    deleteQuery = deleteQuery.not("id", "in", `(${boardIds.join(",")})`);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) throw deleteError;
}

/**
 * Create a new vision board locally.
 * It will be persisted when saveBoards() is called.
 */
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