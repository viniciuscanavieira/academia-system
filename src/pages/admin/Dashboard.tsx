import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, CalendarCheck } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  attendanceToday: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    attendanceToday: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total members
        const { count: totalMembers } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('role', 'member');

        // Get active memberships
        const { count: activeMembers } = await supabase
          .from('memberships')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        // Get monthly revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('payment_date', startOfMonth.toISOString());

        const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Get today's attendance
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count: attendanceToday } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .gte('check_in', startOfDay.toISOString());

        setStats({
          totalMembers: totalMembers || 0,
          activeMembers: activeMembers || 0,
          monthlyRevenue,
          attendanceToday: attendanceToday || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeMembers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.attendanceToday}</p>
            </div>
            <CalendarCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;