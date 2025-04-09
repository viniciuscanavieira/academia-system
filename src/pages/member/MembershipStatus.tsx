import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Membership {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  plan_name: string;
  price: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_date: string;
}

function MembershipStatus() {
  const { user } = useAuthStore();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!user) return;

      try {
        // Get current membership
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        // Get recent payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })
          .limit(5);

        setMembership(membershipData);
        setRecentPayments(paymentsData || []);
      } catch (error) {
        console.error('Error fetching membership data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading membership status...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Membership Status</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            {membership ? (
              <>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{membership.plan_name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Valid until {format(new Date(membership.end_date), 'MMMM d, yyyy')}
                </p>
              </>
            ) : (
              <p className="text-gray-500 mt-2">No active membership</p>
            )}
          </div>
          <CreditCard className="h-12 w-12 text-indigo-600" />
        </div>

        {membership && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-semibold">
                {format(new Date(membership.start_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Monthly Fee</p>
              <p className="text-lg font-semibold">${membership.price.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembershipStatus;