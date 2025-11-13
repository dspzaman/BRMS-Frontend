// src/pages/reports/ViewReports.tsx
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { useState } from 'react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  category: 'requisition' | 'budget' | 'expense' | 'financial';
  icon: string;
  status: 'available' | 'coming_soon';
  lastGenerated?: string;
}

export default function ViewReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dummy report data
  const reports: ReportCard[] = [
    {
      id: 'req-summary',
      title: 'Requisition Summary Report',
      description: 'Overview of all requisitions by status, program, and time period',
      category: 'requisition',
      icon: '📊',
      status: 'coming_soon',
      lastGenerated: '2024-11-10'
    },
    {
      id: 'req-approval',
      title: 'Approval Workflow Report',
      description: 'Track requisition approval times and bottlenecks',
      category: 'requisition',
      icon: '⏱️',
      status: 'coming_soon'
    },
    {
      id: 'req-by-staff',
      title: 'Requisitions by Staff Member',
      description: 'Individual staff requisition history and spending patterns',
      category: 'requisition',
      icon: '👤',
      status: 'coming_soon'
    },
    {
      id: 'budget-utilization',
      title: 'Budget Utilization Report',
      description: 'Current budget usage vs. allocated amounts by program',
      category: 'budget',
      icon: '💰',
      status: 'coming_soon',
      lastGenerated: '2024-11-12'
    },
    {
      id: 'budget-variance',
      title: 'Budget Variance Analysis',
      description: 'Compare actual spending against budgeted amounts',
      category: 'budget',
      icon: '📈',
      status: 'coming_soon'
    },
    {
      id: 'budget-forecast',
      title: 'Budget Forecast Report',
      description: 'Projected spending and remaining budget availability',
      category: 'budget',
      icon: '🔮',
      status: 'coming_soon'
    },
    {
      id: 'expense-category',
      title: 'Expense by Category Report',
      description: 'Breakdown of expenses by category and subcategory',
      category: 'expense',
      icon: '📑',
      status: 'coming_soon'
    },
    {
      id: 'expense-vendor',
      title: 'Vendor Spending Report',
      description: 'Total spending by vendor with payment history',
      category: 'expense',
      icon: '🏢',
      status: 'coming_soon'
    },
    {
      id: 'expense-travel',
      title: 'Travel Expense Report',
      description: 'Detailed travel and mileage expense analysis',
      category: 'expense',
      icon: '🚗',
      status: 'coming_soon'
    },
    {
      id: 'financial-monthly',
      title: 'Monthly Financial Summary',
      description: 'Comprehensive monthly financial overview',
      category: 'financial',
      icon: '📅',
      status: 'coming_soon',
      lastGenerated: '2024-10-31'
    },
    {
      id: 'financial-program',
      title: 'Program Financial Report',
      description: 'Financial performance by program with funder breakdown',
      category: 'financial',
      icon: '🎯',
      status: 'coming_soon'
    },
    {
      id: 'financial-audit',
      title: 'Audit Trail Report',
      description: 'Complete audit trail of all financial transactions',
      category: 'financial',
      icon: '🔍',
      status: 'coming_soon'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Reports', count: reports.length },
    { id: 'requisition', label: 'Requisition Reports', count: reports.filter(r => r.category === 'requisition').length },
    { id: 'budget', label: 'Budget Reports', count: reports.filter(r => r.category === 'budget').length },
    { id: 'expense', label: 'Expense Reports', count: reports.filter(r => r.category === 'expense').length },
    { id: 'financial', label: 'Financial Reports', count: reports.filter(r => r.category === 'financial').length }
  ];

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Layout: header height ~64px → pt-16 */}
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">REPORTS</h1>
              <p className="text-gray-600 mt-2">
                Generate and view various financial and operational reports
              </p>
            </div>

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Reports Coming Soon</h3>
                  <p className="text-sm text-blue-800">
                    The reporting module is currently under development. These reports will be available in future releases.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        selectedCategory === category.id
                          ? 'border-ems-green-600 text-ems-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {category.label}
                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                      {category.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative"
                >
                  {/* Coming Soon Badge */}
                  {report.status === 'coming_soon' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="text-4xl mb-4">{report.icon}</div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {report.description}
                  </p>

                  {/* Last Generated */}
                  {report.lastGenerated && (
                    <p className="text-xs text-gray-500 mb-4">
                      Last generated: {new Date(report.lastGenerated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    disabled={report.status === 'coming_soon'}
                    className={`
                      w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
                      ${
                        report.status === 'coming_soon'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-ems-green-600 text-white hover:bg-ems-green-700'
                      }
                    `}
                  >
                    {report.status === 'coming_soon' ? 'Coming Soon' : 'Generate Report'}
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600">No reports available in this category.</p>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}