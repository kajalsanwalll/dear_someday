import { supabase } from "./supabase/client";

export type AffirmationCategory =
  | "Self-love"
  | "Confidence"
  | "Abundance"
  | "Career"
  | "Love"
  | "Peace"
  | "Health"
  | "Custom";

export type Affirmation = {
  id: string;
  user_id: string;
  content: string;
  category: string;
  is_favorite: boolean;
  practiced_dates: string[];
  created_at: string;
  updated_at: string;
};

export type NewAffirmation = {
  content: string;
  category: string;
};

async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in to continue.");
  }

  return user;
}

export async function getAffirmations(): Promise<Affirmation[]> {
  const user = await getUser();

  const { data, error } = await supabase
    .from("affirmations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []) as Affirmation[];
}

export async function createAffirmation(
  affirmation: NewAffirmation,
): Promise<Affirmation> {
  const user = await getUser();

  const { data, error } = await supabase
    .from("affirmations")
    .insert({
      user_id: user.id,
      content: affirmation.content,
      category: affirmation.category,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Affirmation;
}

export async function updateAffirmation(
  id: string,
  updates: Partial<Affirmation>,
): Promise<Affirmation> {
  const user = await getUser();

  const { data, error } = await supabase
    .from("affirmations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  return data as Affirmation;
}

export async function deleteAffirmation(id: string) {
  const user = await getUser();

  const { error } = await supabase
    .from("affirmations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}