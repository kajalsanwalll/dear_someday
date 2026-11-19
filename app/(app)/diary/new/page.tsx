
import { Suspense } from "react";
import DiaryEditor from "@/components/scrapbook/diary-editor";

export default function NewDiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-16 text-[#958477]">
          Opening your diary... ♡
        </div>
      }
    >
      <DiaryContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DiaryContent({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;

  return <DiaryEditor initialDate={params.date} />;
}
