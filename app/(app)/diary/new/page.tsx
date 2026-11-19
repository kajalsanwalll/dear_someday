
import DiaryEditor from "@/components/scrapbook/diary-editor";

export default async function NewDiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;

  return <DiaryEditor initialDate={params.date} />;
}
