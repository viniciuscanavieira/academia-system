import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

interface TrainerRequest {
  id: string;
  requested_date: string;
  status: string;
  notes: string;
  users: {
    full_name: string;
  };
  trainers: {
    full_name: string;
  };
}

function AdminTrainerRequests() {
  const [requests, setRequests] = useState<TrainerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('personal_trainer_requests')
          .select(`
            *,
            users:user_id(full_name),
            trainers:trainer_id(full_name)
          `)
          .order('requested_date', { ascending: false });

        if (error) throw error;

        setRequests(data || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('personal_trainer_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Atualiza localmente o status
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pedidos de Personal Trainer</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Treinador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(req.requested_date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {req.users?.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {req.trainers?.full_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {req.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : req.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    className="text-green-600 hover:text-green-800"
                    onClick={() => handleUpdateStatus(req.id, 'approved')}
                    disabled={req.status === 'approved'}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleUpdateStatus(req.id, 'rejected')}
                    disabled={req.status === 'rejected'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTrainerRequests;
