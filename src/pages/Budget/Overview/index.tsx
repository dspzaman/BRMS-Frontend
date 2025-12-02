import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import ProgramBudget from "@/features/budget/ProgramBudget";

export default function BudgetOverviewPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            {/* Layout: header height ~64px → pt-16 */}
            <div className="flex min-h-screen pt-16">
                <Sidebar />
                <ProgramBudget />
            </div>
        </div>
    );
}
