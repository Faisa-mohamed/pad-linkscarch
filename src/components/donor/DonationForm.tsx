import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, X } from 'lucide-react';
import { BlockchainManager } from '../../services/blockchainManager';
import { BlockchainService } from '../../services/blockchain';

interface DonationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function DonationForm({ onClose, onSuccess }: DonationFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    brand: '',
    pad_type: 'regular',
    pickup_delivery: 'both' as 'pickup' | 'delivery' | 'both',
    location: '',
    expiry_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const { data: insertedDonation, error: insertError } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          title: formData.title,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          brand: formData.brand || null,
          pad_type: formData.pad_type,
          pickup_delivery: formData.pickup_delivery,
          location: formData.location,
          expiry_date: formData.expiry_date || null,
          status: 'available',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await BlockchainManager.addTransaction({
        id: BlockchainService.generateTransactionId(),
        donationId: insertedDonation.id,
        donorId: user.id,
        donorName: profile?.full_name || 'Anonymous Donor',
        quantity: parseInt(formData.quantity),
        padType: formData.pad_type,
        location: formData.location,
        transactionType: 'created',
        description: `Donation created: ${formData.title}`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Donation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="e.g., 50 Regular Pads Available"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Provide details about your donation..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Number of pads"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand (Optional)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="e.g., Always, Kotex"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pad Type
            </label>
            <select
              value={formData.pad_type}
              onChange={(e) => setFormData({ ...formData, pad_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="regular">Regular</option>
              <option value="overnight">Overnight</option>
              <option value="panty liner">Panty Liner</option>
              <option value="heavy flow">Heavy Flow</option>
              <option value="light flow">Light Flow</option>
              <option value="mixed">Mixed Variety</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pickup_delivery: 'pickup' })}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.pickup_delivery === 'pickup'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Pickup Only
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pickup_delivery: 'delivery' })}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.pickup_delivery === 'delivery'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Delivery Only
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pickup_delivery: 'both' })}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.pickup_delivery === 'both'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="City, State or Zip Code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white py-3 rounded-lg font-semibold hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
