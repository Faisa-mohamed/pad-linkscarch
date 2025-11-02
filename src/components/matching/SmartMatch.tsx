import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Sparkles, MapPin, Package, TrendingUp, Zap, Heart, Target } from 'lucide-react';

type Donation = Database['public']['Tables']['donations']['Row'];
type Request = Database['public']['Tables']['requests']['Row'];

interface Match {
  donation: Donation;
  request: Request;
  score: number;
  reasons: string[];
  distance: string;
}

export function SmartMatch() {
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        supabase.from('donations').select('*').eq('status', 'available'),
        supabase.from('requests').select('*').eq('status', 'open'),
      ]);

      setDonations(donationsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (loc1: string, loc2: string): number => {
    const normalize = (loc: string) => loc.toLowerCase().trim();
    const n1 = normalize(loc1);
    const n2 = normalize(loc2);

    if (n1 === n2) return 0;
    if (n1.includes(n2) || n2.includes(n1)) return 5;

    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));

    if (commonWords.length > 0) return 15;
    return 50;
  };

  const smartMatches = useMemo(() => {
    const matches: Match[] = [];

    donations.forEach(donation => {
      requests.forEach(request => {
        const reasons: string[] = [];
        let score = 0;

        const distance = calculateDistance(donation.location, request.location);
        if (distance === 0) {
          reasons.push('Same location');
          score += 40;
        } else if (distance <= 15) {
          reasons.push('Nearby location');
          score += 25;
        } else if (distance <= 50) {
          reasons.push('Regional match');
          score += 10;
        }

        if (donation.pad_type === request.pad_type) {
          reasons.push('Exact pad type match');
          score += 30;
        } else if (donation.pad_type === 'mixed') {
          reasons.push('Mixed variety available');
          score += 15;
        }

        if (donation.quantity >= request.quantity) {
          reasons.push('Sufficient quantity');
          score += 20;
        } else {
          const ratio = donation.quantity / request.quantity;
          reasons.push(`${Math.round(ratio * 100)}% of requested amount`);
          score += Math.round(ratio * 15);
        }

        if (request.urgency === 'urgent') {
          reasons.push('Urgent need prioritized');
          score += 15;
        }

        const donationAge = Date.now() - new Date(donation.created_at).getTime();
        if (donationAge < 86400000) {
          reasons.push('Fresh donation');
          score += 10;
        }

        if (score > 30) {
          matches.push({
            donation,
            request,
            score,
            reasons,
            distance: distance === 0 ? 'Same location' :
                     distance <= 15 ? 'Nearby' :
                     distance <= 50 ? 'Regional' : 'Distant',
          });
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [donations, requests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing matches...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Possible Match';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <Sparkles className="w-10 h-10 mr-3 text-purple-600" />
                Smart Match
              </h1>
              <p className="text-gray-600 text-lg">
                AI-powered donation matching for maximum impact
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md px-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{smartMatches.length}</div>
                <div className="text-sm text-gray-600">Smart Matches</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{donations.length}</div>
                <div className="text-sm text-gray-600">Available Donations</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{requests.length}</div>
                <div className="text-sm text-gray-600">Open Requests</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {smartMatches.length > 0 ? Math.round(smartMatches[0].score) : 0}%
                </div>
                <div className="text-sm text-gray-600">Best Match Score</div>
              </div>
            </div>
          </div>
        </div>

        {smartMatches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches found</h3>
            <p className="text-gray-600">
              There are currently no optimal matches between donations and requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {smartMatches.map((match, index) => (
              <div
                key={`${match.donation.id}-${match.request.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {match.donation.title}
                        </h3>
                        <p className="text-sm text-gray-600">for {match.request.title}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${getScoreColor(match.score)}`}>
                      {Math.round(match.score)}% {getScoreLabel(match.score)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-rose-50 rounded-lg p-4">
                      <div className="text-xs text-rose-600 font-semibold mb-2">DONATION</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Package className="w-4 h-4 mr-2 text-rose-600" />
                          <span>{match.donation.quantity} × {match.donation.pad_type}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-rose-600" />
                          <span>{match.donation.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-xs text-blue-600 font-semibold mb-2">REQUEST</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{match.request.quantity} × {match.request.pad_type}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{match.request.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Why this match?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {match.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-purple-200"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile?.user_type === 'admin' && (
                    <div className="mt-4 flex space-x-3">
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                        Auto-Connect Match
                      </button>
                      <button className="px-6 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                        Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start space-x-4">
            <Zap className="w-12 h-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-2">How Smart Matching Works</h3>
              <p className="text-purple-100 mb-4">
                Our AI algorithm analyzes location proximity, product type compatibility, quantity needs,
                urgency levels, and donation freshness to find the best matches.
              </p>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold mb-1">40%</div>
                  <div className="text-purple-100">Location</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold mb-1">30%</div>
                  <div className="text-purple-100">Product Type</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold mb-1">20%</div>
                  <div className="text-purple-100">Quantity</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold mb-1">10%</div>
                  <div className="text-purple-100">Urgency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
