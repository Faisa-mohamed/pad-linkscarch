import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { HandHeart, Plus, Calendar } from 'lucide-react';
import { RequestForm } from './RequestForm';

type Request = Database['public']['Tables']['requests']['Row'];

export function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-green-100 text-green-800',
      matched: 'bg-yellow-100 text-yellow-800',
      fulfilled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return styles[urgency as keyof typeof styles] || styles.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
          <p className="text-gray-600 mt-2">Track your pad requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New Request</span>
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <HandHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests yet</h3>
          <p className="text-gray-600 mb-6">Create a request to get the help you need</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
          >
            Create Request
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{request.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <HandHeart className="w-4 h-4 mr-2 text-rose-600" />
                  <span>{request.quantity_needed} pads needed</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-rose-600" />
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getUrgencyBadge(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          onSuccess={loadRequests}
        />
      )}
    </div>
  );
}
