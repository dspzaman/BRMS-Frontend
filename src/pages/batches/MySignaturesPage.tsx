import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { MySignaturesPage as MySignaturesView } from "@/features/batches/ui";

export default function MySignaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            <MySignaturesView />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
