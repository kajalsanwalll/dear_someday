
import { supabase } from "@/lib/supabase";

export type DiaryPhoto = {
  id: string;
  src: string;
  caption: string;
  storagePath?: string;
};

export type DiaryEntry = {
  date: string;
  title: string;
  manifestation: string;
  gratitude: string;
  feelings: string;
  photos: DiaryPhoto[];
  savedAt: string;
};

const BUCKET = "diary-photos";

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("Please sign in to access your diary.");

  return data.user.id;
}

// Convert a Base64 data URL into a Blob
function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

// Upload a photo and return its private storage path
export async function uploadDiaryPhoto(
  date: string,
  photo: DiaryPhoto
): Promise<DiaryPhoto> {
  const userId = await getUserId();

  // Already uploaded
  if (photo.storagePath) {
    return photo;
  }

  if (!photo.src.startsWith("data:")) {
    throw new Error("Invalid photo format.");
  }

  const blob = dataUrlToBlob(photo.src);
  const path = `${userId}/${date}/${photo.id}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw error;

  return {
    id: photo.id,
    caption: photo.caption,
    src: "",
    storagePath: path,
  };
}

// Create a temporary signed URL for a private photo
async function getPhotoUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

// Return diary photos with usable URLs
async function hydratePhotos(
  photos: DiaryPhoto[]
): Promise<DiaryPhoto[]> {
  return Promise.all(
    photos.map(async (photo) => {
      if (!photo.storagePath) return photo;

      return {
        ...photo,
        src: await getPhotoUrl(photo.storagePath),
      };
    })
  );
}

// Fetch all diary entries
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;

  return Promise.all(
    (data || []).map(async (row) => ({
      date: row.date,
      title: row.title || "",
      manifestation: row.manifestation || "",
      gratitude: row.gratitude || "",
      feelings: row.feelings || "",
      photos: await hydratePhotos(row.photos || []),
      savedAt: row.saved_at || row.created_at,
    }))
  );
}

// Fetch a diary entry for one date
export async function getDiaryEntry(
  date: string
): Promise<DiaryEntry | null> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    date: data.date,
    title: data.title || "",
    manifestation: data.manifestation || "",
    gratitude: data.gratitude || "",
    feelings: data.feelings || "",
    photos: await hydratePhotos(data.photos || []),
    savedAt: data.saved_at || data.created_at,
  };
}

// Save or update a diary entry
export async function saveDiaryEntry(
  entry: DiaryEntry
): Promise<void> {
  const userId = await getUserId();

  const photos = await Promise.all(
    entry.photos.map((photo) => uploadDiaryPhoto(entry.date, photo))
  );

  const { error } = await supabase
    .from("diary_entries")
    .upsert(
      {
        user_id: userId,
        date: entry.date,
        title: entry.title,
        manifestation: entry.manifestation,
        gratitude: entry.gratitude,
        feelings: entry.feelings,
        photos,
        saved_at: entry.savedAt,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,date",
      }
    );

  if (error) throw error;
}

// Delete a diary entry and its photos
export async function deleteDiaryEntry(date: string): Promise<void> {
  const userId = await getUserId();

  const existing = await getDiaryEntry(date);
  if (!existing) return;

  const paths = existing.photos
    .map((photo) => photo.storagePath)
    .filter((path): path is string => Boolean(path));

  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);

  if (error) throw error;
}
