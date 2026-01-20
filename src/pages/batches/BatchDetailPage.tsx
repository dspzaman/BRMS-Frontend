import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { BatchDetailPage as BatchDetailView } from "@/features/batches/ui";

export default function BatchDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            <BatchDetailView />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
