import { useState } from "react";
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import ProfileOverview from "@/features/profile/ui/ProfileOverview";
import EditProfile from "@/features/profile/ui/EditProfile";
import ChangePassword from "@/features/profile/ui/ChangePassword";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">MY PROFILE</h1>
              <p className="text-gray-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'overview'
                      ? 'border-ems-green-500 text-ems-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'edit'
                      ? 'border-ems-green-500 text-ems-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'security'
                      ? 'border-ems-green-500 text-ems-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Security
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl">
              {activeTab === 'overview' && <ProfileOverview onEdit={() => setActiveTab('edit')} />}
              {activeTab === 'edit' && <EditProfile onSuccess={() => setActiveTab('overview')} />}
              {activeTab === 'security' && <ChangePassword />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}