import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Package, MapPin, Calendar, Filter } from 'lucide-react';
import { BlockchainManager } from '../../services/blockchainManager';
import { BlockchainService } from '../../services/blockchain';
import { Toast } from '../common/Toast';

type Donation = Database['public']['Tables']['donations']['Row'];

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function DonationsList() {
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', message: '' });

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('status', 'available')
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
  }, []);

  const handleReserve = async (donationId: string) => {
    if (!user || profile?.user_type !== 'recipient') return;

    try {
      const donation = donations.find(d => d.id === donationId);
      if (!donation) return;

      const { error } = await supabase
        .from('donations')
        .update({
          status: 'reserved',
          reserved_by: user.id,
          reserved_at: new Date().toISOString(),
        })
        .eq('id', donationId);

      if (error) throw error;

      const { data: donorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', donation.donor_id)
        .single();

      await BlockchainManager.addTransaction({
        id: BlockchainService.generateTransactionId(),
        donationId: donation.id,
        donorId: donation.donor_id,
        donorName: donorProfile?.full_name || 'Anonymous Donor',
        recipientId: user.id,
        recipientName: profile?.full_name || 'Anonymous Recipient',
        quantity: donation.quantity,
        padType: donation.pad_type,
        location: donation.location,
        transactionType: 'reserved',
        description: `Donation reserved by ${profile?.full_name || 'recipient'}`,
      });

      loadDonations();
      setToast({
        show: true,
        type: 'success',
        message: 'Donation reserved successfully and recorded on blockchain!',
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: 'error',
        message: 'Failed to reserve donation: ' + error.message,
      });
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.pad_type === filter;
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Donations</h1>
        <p className="text-gray-600">Browse and reserve pad donations from generous donors</p>
      </div>

      <div className="mb-6 flex items-center space-x-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="regular">Regular</option>
          <option value="overnight">Overnight</option>
          <option value="panty liner">Panty Liner</option>
          <option value="heavy flow">Heavy Flow</option>
          <option value="light flow">Light Flow</option>
          <option value="mixed">Mixed Variety</option>
        </select>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations available</h3>
          <p className="text-gray-600">Check back later for new donations</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDonations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{donation.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Available
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{donation.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-700">
                  <Package className="w-4 h-4 mr-2 text-rose-600" />
                  <span className="font-semibold">{donation.quantity} pads - {donation.pad_type}</span>
                </div>
                {donation.brand && <div className="text-gray-600">Brand: {donation.brand}</div>}
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-rose-600" />
                  <span>{donation.location}</span>
                </div>
                <div className="flex items-center text-gray-600 text-xs">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Posted {new Date(donation.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {profile?.user_type === 'recipient' && (
                <button
                  onClick={() => handleReserve(donation.id)}
                  className="w-full bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
                >
                  Reserve This Donation
                </button>
              )}

              {profile?.user_type !== 'recipient' && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Sign up as a recipient to reserve
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
