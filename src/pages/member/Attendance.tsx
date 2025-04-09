import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  check_in: string;
  check_out: string | null;
}

function Attendance() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        // Get attendance history
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', user.id)
          .order('check_in', { ascending: false });

        // Check for current session
        const currentSessionData = attendanceData?.find(
          record => record.check_in && !record.check_out
        );

        setAttendance(attendanceData || []);
        setCurrentSession(currentSessionData || null);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([
          { user_id: user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setAttendance([data, ...attendance]);
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!currentSession || !user) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(null);
      setAttendance(attendance.map(record =>
        record.id === data.id ? data : record
      ));
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentSession
                ? 'You are currently checked in'
                : 'You are not checked in'}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-indigo-600" />
        </div>

        <button
          onClick={currentSession ? handleCheckOut : handleCheckIn}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            currentSession
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {currentSession ? 'Check Out' : 'Check In'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => {
              const checkIn = new Date(record.check_in);
              const checkOut = record.check_out ? new Date(record.check_out) : null;
              const duration = checkOut
                ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60))
                : null;

              return (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(checkIn, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(checkIn, 'h:mm a')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {checkOut ? format(checkOut, 'h:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {duration ? `${duration} minutes` : 'In progress'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;