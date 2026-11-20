
import { supabase } from "./supabase/client";

export type DreamStatus =
  | "dreaming"
  | "in_progress"
  | "almost_there"
  | "manifested";

export type DreamCategory =
  | "Career"
  | "Education"
  | "Travel"
  | "Relationships"
  | "Lifestyle"
  | "Personal"
  | "Health"
  | "Finance"
  | "Other";

export interface DreamStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface DreamUpdate {
  id: string;
  content: string;
  createdAt: string;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  description: string;
  why: string;
  category: DreamCategory;
  status: DreamStatus;
  target_date: string | null;
  cover_image: string | null;
  steps: DreamStep[];
  updates: DreamUpdate[];
  manifested_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type NewDream = Omit<
  Dream,
  | "id"
  | "user_id"
  | "created_at"
  | "updated_at"
>;

// Fetch all dreams
export async function getDreams(): Promise<Dream[]> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please sign in to view your dreams.");
  }

  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch dreams:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as Dream[];
}

// Create a dream
export async function createDream(
  dream: NewDream
): Promise<Dream> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please sign in to create a dream.");
  }

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      ...dream,
      user_id: authData.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create dream:", error);
    throw new Error(error.message);
  }

  return data as Dream;
}

// Update a dream
export async function updateDream(
  id: string,
  updates: Partial<NewDream>
): Promise<Dream> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please sign in to update your dream.");
  }

  const { data, error } = await supabase
    .from("dreams")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update dream:", error);
    throw new Error(error.message);
  }

  return data as Dream;
}

// Delete a dream
export async function deleteDream(
  id: string
): Promise<void> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please sign in to delete your dream.");
  }

  const { error } = await supabase
    .from("dreams")
    .delete()
    .eq("id", id)
    .eq("user_id", authData.user.id);

  if (error) {
    console.error("Failed to delete dream:", error);
    throw new Error(error.message);
  }
}
