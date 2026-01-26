import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { 
  useAssignedRequisitionsCount, 
  usePaymentProcessingCount, 
  usePendingSignaturesCount 
} from "@/features/requisitions/api/useRequisitionCounts";

export default function Sidebar() {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  // Fetch counts conditionally based on user permissions
  const assignedCount = useAssignedRequisitionsCount(!!user?.can_approve);
  const paymentCount = usePaymentProcessingCount(hasRole('account'));
  const signaturesCount = usePendingSignaturesCount(!!user?.signaturee_authority);

  // Count badge component
  const CountBadge = ({ count, isActive }: { count?: number; isActive: boolean }) => {
    if (!count || count === 0) return null;
    return (
      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
        isActive ? 'bg-white text-ems-green-600' : 'bg-ems-green-600 text-white'
      }`}>
        {count}
      </span>
    );
  };

  return (
    <aside className="w-64 bg-gray-50 transition-all duration-300" style={{ backgroundColor: "#F8F8F8" }}>
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {/* Dashboard */}
          <Link 
            to="/dashboard"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              location.pathname === '/dashboard' 
                ? 'text-white bg-ems-green-600' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Dashboard
          </Link>

          {/* My Requisitions */}
          <Link 
            to="/requisitions/my-requisitions"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              location.pathname === '/requisitions/my-requisitions' 
                ? 'text-white bg-ems-green-600' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Requisitions
          </Link>

          {/* Create New Requisition */}
          {/* <Link 
            to="/requisitions/create"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              location.pathname === '/requisitions/create' 
                ? 'text-white bg-ems-green-600' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New
          </Link> */}

          {/* Assigned Requisitions - Only show for users with approval rights */}
          {user?.can_approve && (
            <Link 
              to="/requisitions/assigned"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === '/requisitions/assigned' || location.pathname.startsWith('/requisitions/approve/')
  
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assigned Requisitions
              <CountBadge count={assignedCount.data} isActive={location.pathname === '/requisitions/assigned' || location.pathname.startsWith('/requisitions/approve/')} />
            </Link>
          )}

          {/* Ready For Payment - Only show for users with account role */}
          {hasRole('account') && (
            <Link 
              to="/payment-processing"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname.startsWith('/payment-processing')
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ready For Payment
              <CountBadge count={paymentCount.data} isActive={location.pathname.startsWith('/payment-processing')} />
            </Link>
          )}

          {/* Processed Payments - Show for account team and signaturees */}
          {(hasRole('account') || user?.signaturee_authority) && (
            <Link 
              to="/processed-payments"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname.startsWith('/processed-payments')
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Processed Payments
            </Link>
          )}

          {/* My Signatures - Only show for users with signaturee authority */}
          {user?.signaturee_authority && (
            <Link 
              to="/batches/my-signatures"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === '/batches/my-signatures'
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              My Signatures
              <CountBadge count={signaturesCount.data} isActive={location.pathname === '/batches/my-signatures'} />
            </Link>
          )}

          {/* Program Budget - Only show for Program Manager, Program Director, and Executive Director */}
          {user?.roles?.some(role => 
            ['program_manager', 'program_director', 'executive_director'].includes(role.role)
          ) && (
            <Link 
              to="/budget/program"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === '/budget/program' || location.pathname.startsWith('/budget/program/')
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Program Budget
            </Link>
          )}

          {/* Reports */}
          <Link 
            to="/reports"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === '/reports' 
                  ? 'text-white bg-ems-green-600' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </Link> 
        </div>
      </nav>
    </aside>
  );
}