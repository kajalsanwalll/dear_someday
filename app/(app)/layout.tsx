
import Sidebar from "@/components/scrapbook/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />

      <main className="min-h-screen md:ml-[250px]">
        {children}
      </main>
    </div>
  );
}
