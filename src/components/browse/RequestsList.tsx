import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { HandHeart, Calendar, AlertCircle, Filter } from 'lucide-react';

type Request = Database['public']['Tables']['requests']['Row'];

export function RequestsList() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
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
  }, []);

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return styles[urgency as keyof typeof styles] || styles.medium;
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.urgency === filter;
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Active Requests</h1>
        <p className="text-gray-600">View requests from people in need of menstrual pads</p>
      </div>

      <div className="mb-6 flex items-center space-x-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="all">All Urgency Levels</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <HandHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No active requests</h3>
          <p className="text-gray-600">Check back later for new requests</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{request.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadge(request.urgency)}`}>
                  {request.urgency}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{request.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-700">
                  <HandHeart className="w-4 h-4 mr-2 text-rose-600" />
                  <span className="font-semibold">{request.quantity_needed} pads needed</span>
                </div>
                {request.pad_type_preference && (
                  <div className="flex items-center text-gray-700">
                    <AlertCircle className="w-4 h-4 mr-2 text-rose-600" />
                    <span>Prefers: {request.pad_type_preference}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600 text-xs">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {profile?.user_type === 'donor' && (
                <button className="w-full bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 transition">
                  Contact Recipient
                </button>
              )}

              {profile?.user_type !== 'donor' && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Sign up as a donor to help
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
