import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Header } from '@/layouts/header';
import { Sidebar } from '@/layouts/sidebar';
import { Footer } from '@/layouts/footer';
import { AssignedRequisitions } from '@/features/requisitions/ui/AssignedRequisitions';
import TeamOverviewView from '@/features/requisitions/ui/AssignedRequisitions/TeamOverviewView';
import { useAssignedToMe, useMyProcessedRequisitions } from '@/features/requisitions/api/useRequisitions';

export default function AssignedRequisitionsPage() {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'processed' | 'team'>('pending');

  // Check if user has team oversight role
  const hasTeamOversight = user?.roles?.some(role => 
    ['coordinator', 'manager', 'program_manager', 'program_director', 'executive_director'].includes(role.role)
  );

  // Debug: Log user roles and hasTeamOversight

  // Fetch data based on active tab
  const pendingQuery = useAssignedToMe();
  const processedQuery = useMyProcessedRequisitions();

  // If user has no approval rights and no pending requisitions, show info message
  if (!user?.can_approve && pendingQuery.data?.count === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white">
            <div className="p-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">You currently have no requisitions assigned to you for review or approval.</p>
              </div>
            </div>
            <Footer />
          </main>
        </div>
      </div>
    );
  }

  // Select the appropriate query based on active tab
  const activeQuery = activeTab === 'pending' ? pendingQuery : processedQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">ASSIGNED REQUISITIONS</h1>
              <p className="text-gray-600 mt-2">
                Review and approve requisitions assigned to you
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'pending'
                      ? 'border-ems-green-500 text-ems-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Pending
                  {pendingQuery.data?.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {pendingQuery.data.count}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('processed')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'processed'
                      ? 'border-ems-green-500 text-ems-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Processed
                  {processedQuery.data?.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {processedQuery.data.count}
                    </span>
                  )}
                </button>

                {/* Team Overview Tab - Only show for users with team oversight */}
                {hasTeamOversight && (
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === 'team'
                        ? 'border-ems-green-500 text-ems-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    👥 Team Overview
                  </button>
                )}
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'team' ? (
              <TeamOverviewView />
            ) : (
              <AssignedRequisitions 
                data={activeQuery.data}
                isLoading={activeQuery.isLoading}
                error={activeQuery.error}
                isProcessedView={activeTab === 'processed'}
              />
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}