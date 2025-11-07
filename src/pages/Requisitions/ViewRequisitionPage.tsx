// src/pages/Requisitions/ViewRequisitionPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
// import { RequisitionDetails } from '@/features/requisitions/ui/RequisitionDetails';
// import { useRequisition } from '@/features/requisitions/hooks/useRequisition';

export default function ViewRequisitionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { data: requisition, isLoading, error } = useRequisition(Number(id));

  // TODO: Uncomment when RequisitionDetails and useRequisition hook are ready
  // Handle loading state
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Header />
  //       <div className="flex min-h-screen pt-16">
  //         <Sidebar />
  //         <main className="flex-1 bg-white flex items-center justify-center">
  //           <div className="text-center">
  //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600 mx-auto"></div>
  //             <p className="mt-4 text-gray-600">Loading requisition...</p>
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

  // Handle error state
  // if (error || !requisition) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Header />
  //       <div className="flex min-h-screen pt-16">
  //         <Sidebar />
  //         <main className="flex-1 bg-white flex items-center justify-center">
  //           <div className="text-center p-8">
  //             <div className="text-red-600 text-5xl mb-4">⚠️</div>
  //             <h2 className="text-2xl font-bold text-gray-900 mb-2">
  //               Requisition Not Found
  //             </h2>
  //             <p className="text-gray-600 mb-6">
  //               The requisition you're looking for doesn't exist or you don't have permission to view it.
  //             </p>
  //             <button
  //               onClick={() => navigate('/requisitions/my-requisitions')}
  //               className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
  //             >
  //               Back to My Requisitions
  //             </button>
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    REQUISITION #{id}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    View requisition details and status
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Show Edit button only for drafts */}
                  {/* {requisition.status === 'draft' && (
                    <button
                      onClick={() => navigate(`/requisitions/edit/${id}`)}
                      className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
                    >
                      Edit
                    </button>
                  )} */}
                  <button
                    onClick={() => navigate('/requisitions/my-requisitions')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to List
                  </button>
                </div>
              </div>
            </div>

            {/* Dummy Content - TODO: Replace with RequisitionDetails */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                View Requisition Page - Coming Soon
              </h2>
              <p className="text-gray-600 mb-4">
                This page will display all details for requisition #{id}
              </p>
              <p className="text-sm text-gray-500">
                TODO: Integrate RequisitionDetails component
              </p>
            </div>

            {/* <RequisitionDetails requisition={requisition} /> */}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}