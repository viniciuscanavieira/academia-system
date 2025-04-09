import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Clock, Dumbbell } from 'lucide-react';

interface MemberStats {
  lastCheckIn: string | null;
  totalVisits: number;
  nextTrainingSession: string | null;
}

function MemberDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<MemberStats>({
    lastCheckIn: null,
    totalVisits: 0,
    nextTrainingSession: null
  });

  useEffect(() => {
    const fetchMemberStats = async () => {
      if (!user) return;

      try {
        // Get last check-in
        const { data: lastCheckIn } = await supabase
          .from('attendance')
          .select('check_in')
          .eq('user_id', user.id)
          .order('check_in', { ascending: false })
          .limit(1)
          .single();

        // Get total visits
        const { count: totalVisits } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        // Get next training session
        const { data: nextSession } = await supabase
          .from('personal_trainer_requests')
          .select('requested_date')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .gte('requested_date', new Date().toISOString())
          .order('requested_date')
          .limit(1)
          .single();

        setStats({
          lastCheckIn: lastCheckIn?.check_in || null,
          totalVisits: totalVisits || 0,
          nextTrainingSession: nextSession?.requested_date || null
        });
      } catch (error) {
        console.error('Error fetching member stats:', error);
      }
    };

    fetchMemberStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Last Visit</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.lastCheckIn
                  ? new Date(stats.lastCheckIn).toLocaleDateString()
                  : 'No visits yet'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Next Training</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.nextTrainingSession
                  ? new Date(stats.nextTrainingSession).toLocaleDateString()
                  : 'No sessions scheduled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {/* Handle check-in */}}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Check In
          </button>
          <button
            onClick={() => {/* Handle training request */}}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Request Training Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;