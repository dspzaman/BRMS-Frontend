import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

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
            </Link>
          )}

          {/* Reports */}
          {/* <Link 
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
          </Link> */}
        </div>
      </nav>
    </aside>
  );
}