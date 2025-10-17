import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import Dashboard from "@/features/dashboard/ui/Dashboard";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            {/* Layout: header height ~64px → pt-16 */}
            <div className="flex min-h-screen pt-16">
                <Sidebar />
                <Dashboard />
            </div>
        </div>
    );
}
