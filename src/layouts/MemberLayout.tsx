import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, CreditCard, Calendar, UserCog, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

function MemberLayout() {
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">GymPro Member</h1>
        </div>
        <nav className="mt-8">
          <Link to="/member" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link to="/member/status" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <CreditCard className="w-5 h-5 mr-2" />
            Membership Status
          </Link>
          <Link to="/member/attendance" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance
          </Link>
          <Link to="/member/personal" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <UserCog className="w-5 h-5 mr-2" />
            Personal Trainer
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MemberLayout;