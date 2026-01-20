import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { ChequeGenerationPage as ChequeGenerationPageComponent } from '@/features/batches/ui';

export default function ChequeGenerationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            <ChequeGenerationPageComponent />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
