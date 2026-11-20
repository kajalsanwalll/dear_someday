import { supabase } from "./supabase/client";
export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  prompt: string;
  mood: string;
  gratitude: string;
  created_at: string;
  updated_at: string;
};

export type NewJournalEntry = {
  title?: string;
  content: string;
  prompt?: string;
  mood?: string;
  gratitude?: string;
};

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData.user;

  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function createJournalEntry(
  entry: NewJournalEntry
): Promise<JournalEntry> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData.user;

  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      ...entry,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<NewJournalEntry>
): Promise<JournalEntry> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData.user;

  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteJournalEntry(
  id: string
): Promise<void> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData.user;

  if (!user) throw new Error("You must be logged in.");

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}