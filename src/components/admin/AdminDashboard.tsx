import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users, Package, HandHeart, BookOpen, Shield,
  TrendingUp, Activity, DollarSign, Link as LinkIcon
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  totalRecipients: number;
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalRequests: number;
  totalArticles: number;
  blockchainBlocks: number;
  totalWalletBalance: number;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDonors: 0,
    totalRecipients: 0,
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalRequests: 0,
    totalArticles: 0,
    blockchainBlocks: 0,
    totalWalletBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.user_type === 'admin') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      const [
        usersResult,
        donationsResult,
        requestsResult,
        articlesResult,
        blockchainResult,
        actionsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('user_type, wallet_balance'),
        supabase.from('donations').select('status'),
        supabase.from('requests').select('id'),
        supabase.from('educational_content').select('id'),
        supabase.from('blockchain').select('id'),
        supabase.from('admin_actions').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const users = usersResult.data || [];
      const donations = donationsResult.data || [];
      const requests = requestsResult.data || [];
      const articles = articlesResult.data || [];
      const blocks = blockchainResult.data || [];

      setStats({
        totalUsers: users.length,
        totalDonors: users.filter(u => u.user_type === 'donor').length,
        totalRecipients: users.filter(u => u.user_type === 'recipient').length,
        totalDonations: donations.length,
        activeDonations: donations.filter(d => d.status === 'available').length,
        completedDonations: donations.filter(d => d.status === 'completed').length,
        totalRequests: requests.length,
        totalArticles: articles.length,
        blockchainBlocks: blocks.length,
        totalWalletBalance: users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0),
      });

      setRecentActions(actionsResult.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.user_type !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', subtext: `${stats.totalDonors} donors, ${stats.totalRecipients} recipients` },
    { label: 'Total Donations', value: stats.totalDonations, icon: Package, color: 'green', subtext: `${stats.activeDonations} active, ${stats.completedDonations} completed` },
    { label: 'Active Requests', value: stats.totalRequests, icon: HandHeart, color: 'orange', subtext: 'Help requests from recipients' },
    { label: 'Educational Articles', value: stats.totalArticles, icon: BookOpen, color: 'purple', subtext: 'Published content' },
    { label: 'Blockchain Blocks', value: stats.blockchainBlocks, icon: LinkIcon, color: 'rose', subtext: 'Immutable transaction records' },
    { label: 'Total Wallet Balance', value: stats.totalWalletBalance, icon: DollarSign, color: 'teal', subtext: 'Platform tokens in circulation' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <Shield className="w-10 h-10 mr-3 text-rose-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Platform overview and management</p>
            </div>
            <div className="flex items-center space-x-2 bg-rose-100 px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-semibold text-rose-700">Live Data</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              orange: 'bg-orange-100 text-orange-600',
              purple: 'bg-purple-100 text-purple-600',
              rose: 'bg-rose-100 text-rose-600',
              teal: 'bg-teal-100 text-teal-600',
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.subtext}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-rose-600" />
            Recent Admin Actions
          </h2>
          {recentActions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent actions recorded</p>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-rose-600 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{action.action_type}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(action.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
