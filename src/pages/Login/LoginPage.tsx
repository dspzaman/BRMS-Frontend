import LoginForm from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo/Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-bold text-ems-green-500 mb-2">BRMS</h1>
        <h2 className="text-xl text-gray-600">
          Budget &amp; Requisition Management System
        </h2>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              Sign in to your account
            </h3>
          </div>
          <LoginForm />

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Need help? Contact your system administrator
          </div>
        </div>
      </div>
    </div>
  );
}
