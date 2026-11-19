
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
  description: string | null;
  category: string | null;
  cover_color: string;
  created_at: string;
  items: VisionBoardItem[] | null;
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

function toDatabase(board: VisionBoard, userId: string) {
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

function getMigrationKey(userId: string) {
  return `${MIGRATION_KEY}-${userId}`;
}

/**
 * Read existing local boards without modifying localStorage.
 */
function getLocalBoards(): VisionBoard[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error("Local vision boards data is not an array.");
    }

    return parsed as VisionBoard[];
  } catch (error) {
    console.error("Could not read local vision boards:", error);
    throw new Error(
      "Your locally saved vision boards could not be read. Your original data has been preserved."
    );
  }
}

/**
 * Migrate localStorage boards into Supabase.
 * Never delete the original localStorage data.
 * Only mark migration complete after successful migration.
 */
async function migrateLocalBoards(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const migrationKey = getMigrationKey(userId);

  if (localStorage.getItem(migrationKey) === "true") {
    return;
  }

  const localBoards = getLocalBoards();

  if (localBoards.length === 0) {
    localStorage.setItem(migrationKey, "true");
    return;
  }

  console.info(
    `Migrating ${localBoards.length} local vision boards...`
  );

  // Read existing database records first.
  const { data: existingBoards, error: fetchError } = await supabase
    .from("vision_boards")
    .select("id")
    .eq("user_id", userId);

  if (fetchError) {
    console.error("Migration: could not check existing boards:", fetchError);

    throw new Error(
      `Could not check existing vision boards: ${fetchError.message}`
    );
  }

  const existingIds = new Set(
    (existingBoards ?? []).map((board) => board.id)
  );

  // Only insert boards that do not already exist for this user.
  const boardsToInsert = localBoards
    .filter((board) => !existingIds.has(board.id))
    .map((board) => toDatabase(board, userId));

  if (boardsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("vision_boards")
      .insert(boardsToInsert);

    if (insertError) {
      console.error("Migration failed:", insertError);

      throw new Error(
        `Could not migrate vision boards: ${insertError.message}`
      );
    }
  }

  // Verify the migrated boards exist before marking migration complete.
  const { data: verifiedBoards, error: verifyError } = await supabase
    .from("vision_boards")
    .select("id")
    .eq("user_id", userId);

  if (verifyError) {
    throw new Error(
      `Could not verify migrated boards: ${verifyError.message}`
    );
  }

  const verifiedIds = new Set(
    (verifiedBoards ?? []).map((board) => board.id)
  );

  const allMigrated = localBoards.every((board) =>
    verifiedIds.has(board.id)
  );

  if (!allMigrated) {
    throw new Error(
      "Some vision boards could not be verified after migration."
    );
  }

  localStorage.setItem(migrationKey, "true");

  console.info("Vision board migration completed successfully.");
}

/**
 * Get all vision boards belonging to the current user.
 */
export async function getBoards(): Promise<VisionBoard[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  if (!user) {
    throw new Error("You must be logged in to load vision boards.");
  }

  // Preserve and migrate existing local boards first.
  await migrateLocalBoards(user.id);

  const { data, error } = await supabase
    .from("vision_boards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getBoards error:", error);

    throw new Error(
      `Failed to load vision boards: ${error.message} (Code: ${error.code})`
    );
  }

  return (data as DatabaseBoard[]).map(fromDatabase);
}

/**
 * Save the supplied vision boards.
 *
 * IMPORTANT:
 * This function does not delete boards missing from the array.
 */
export async function saveBoards(
  boards: VisionBoard[]
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  if (!user) {
    throw new Error("You must be logged in to save vision boards.");
  }

  if (boards.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("vision_boards")
    .upsert(
      boards.map((board) => toDatabase(board, user.id)),
      { onConflict: "id" }
    );

  if (error) {
    console.error("Supabase saveBoards error:", error);

    throw new Error(
      `Failed to save vision boards: ${error.message} (Code: ${error.code})`
    );
  }
}

/**
 * Explicitly delete a single vision board.
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  if (!user) {
    throw new Error("You must be logged in to delete vision boards.");
  }

  const { error } = await supabase
    .from("vision_boards")
    .delete()
    .eq("id", boardId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Supabase deleteBoard error:", error);

    throw new Error(
      `Failed to delete vision board: ${error.message} (Code: ${error.code})`
    );
  }
}

/**
 * Create a new vision board.
 * It is persisted when saveBoards() is called.
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
