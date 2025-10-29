import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Package, Plus, Calendar, MapPin } from 'lucide-react';
import { DonationForm } from './DonationForm';

type Donation = Database['public']['Tables']['donations']['Row'];

export function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadDonations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.available;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Donations</h1>
          <p className="text-gray-600 mt-2">Manage your pad donations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New Donation</span>
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations yet</h3>
          <p className="text-gray-600 mb-6">Create your first donation to help someone in need</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
          >
            Create Donation
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{donation.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(donation.status)}`}>
                  {donation.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{donation.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <Package className="w-4 h-4 mr-2 text-rose-600" />
                  <span>{donation.quantity} pads - {donation.pad_type}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-rose-600" />
                  <span>{donation.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-rose-600" />
                  <span>{new Date(donation.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DonationForm
          onClose={() => setShowForm(false)}
          onSuccess={loadDonations}
        />
      )}
    </div>
  );
}
