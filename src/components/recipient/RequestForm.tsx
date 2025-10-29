import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { HandHeart, X } from 'lucide-react';

interface RequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestForm({ onClose, onSuccess }: RequestFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity_needed: '',
    pad_type_preference: 'regular',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          recipient_id: user.id,
          title: formData.title,
          description: formData.description,
          quantity_needed: parseInt(formData.quantity_needed),
          pad_type_preference: formData.pad_type_preference,
          urgency: formData.urgency,
          status: 'open',
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
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
              <HandHeart className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Request</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="e.g., Need 30 Regular Pads"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Tell us about your situation and needs..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Needed</label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity_needed}
              onChange={(e) => setFormData({ ...formData, quantity_needed: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Number of pads needed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Pad Type</label>
            <select
              value={formData.pad_type_preference}
              onChange={(e) => setFormData({ ...formData, pad_type_preference: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="regular">Regular</option>
              <option value="overnight">Overnight</option>
              <option value="panty liner">Panty Liner</option>
              <option value="heavy flow">Heavy Flow</option>
              <option value="light flow">Light Flow</option>
              <option value="any">Any Type</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'low', label: 'Low', desc: 'Within a month', color: 'green' },
                { value: 'medium', label: 'Medium', desc: 'Within 2 weeks', color: 'yellow' },
                { value: 'high', label: 'High', desc: 'Within a week', color: 'orange' },
                { value: 'urgent', label: 'Urgent', desc: 'ASAP', color: 'red' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: option.value as any })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.urgency === option.value
                      ? `border-${option.color}-600 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
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
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
