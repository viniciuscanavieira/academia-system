import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { UserCog } from 'lucide-react';

interface Trainer {
  id: string;
  full_name: string;
}

interface TrainingRequest {
  id: string;
  trainer_id: string;
  requested_date: string;
  status: string;
  notes: string;
  trainers: {
    full_name: string;
  };
}

function PersonalTrainer() {
  const { user } = useAuthStore();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get trainers
        const { data: trainersData } = await supabase
          .from('users')
          .select('id, full_name')
          .eq('role', 'admin');

        // Get training requests
        const { data: requestsData } = await supabase
          .from('personal_trainer_requests')
          .select(`
            *,
            trainers:users!personal_trainer_requests_trainer_id_fkey(
              full_name
            )
          `)
          .eq('user_id', user.id)
          .order('requested_date', { ascending: false });

        setTrainers(trainersData || []);
        setRequests(requestsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTrainer || !requestDate) return;

    try {
      const { data, error } = await supabase
        .from('personal_trainer_requests')
        .insert([
          {
            user_id: user.id,
            trainer_id: selectedTrainer,
            requested_date: requestDate,
            notes
          }
        ])
        .select(`
          *,
          trainers:users!personal_trainer_requests_trainer_id_fkey(
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setRequests([data, ...requests]);
      setSelectedTrainer('');
      setRequestDate('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading trainer data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Personal Trainer</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Request a Session</h2>
            <p className="text-sm text-gray-500 mt-1">
              Book a personal training session with one of our trainers
            </p>
          </div>
          <UserCog className="h-8 w-8 text-indigo-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trainer" className="block text-sm font-medium text-gray-700">
              Select Trainer
            </label>
            <select
              id="trainer"
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Choose a trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Preferred Date
            </label>
            <input
              type="date"
              id="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Any specific requirements or goals..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit Request
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Requests</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trainer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(request.requested_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.trainers.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {request.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PersonalTrainer;