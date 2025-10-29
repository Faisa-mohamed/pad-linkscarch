import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WalletService } from '../../services/walletService';
import { Wallet, TrendingUp, TrendingDown, Clock, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  blockchain_hash: string | null;
  created_at: string;
}

export function WalletDashboard() {
  const { user, profile } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingWallet, setHasExistingWallet] = useState(false);
  const [hasWelcomeBonus, setHasWelcomeBonus] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadWalletData();
    }
  }, [user, profile]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setError(null);

      const [walletExists, bonusExists] = await Promise.all([
        WalletService.hasWallet(user.id),
        WalletService.hasReceivedWelcomeBonus(user.id),
      ]);

      setHasExistingWallet(walletExists);
      setHasWelcomeBonus(bonusExists);
      setWalletAddress(profile?.wallet_address || null);

      if (profile?.wallet_address) {
        const [balanceData, transactionsData] = await Promise.all([
          WalletService.getWalletBalance(user.id),
          WalletService.getTransactionHistory(user.id),
        ]);

        setBalance(balanceData);
        setTransactions(transactionsData);
      }
    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      setError('Failed to load wallet data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!user) return;

    if (hasExistingWallet) {
      setError('You already have a wallet. Each user can only create one wallet.');
      return;
    }

    if (hasWelcomeBonus) {
      setError('Welcome bonus already claimed. Cannot create a new wallet.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newAddress = await WalletService.createWallet(user.id);
      setWalletAddress(newAddress);
      setHasExistingWallet(true);
      setHasWelcomeBonus(true);

      await loadWalletData();

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Wallet creation error:', error);
      setError(error.message || 'Failed to create wallet. Please try again.');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Your PadLink Wallet</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Set up your digital wallet to track donations on the blockchain. Your wallet will be credited
            with 100 tokens as a welcome bonus to get started!
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 text-left max-w-2xl mx-auto">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {hasWelcomeBonus && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 text-left max-w-2xl mx-auto">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-semibold">Welcome Bonus Already Claimed</p>
                <p className="text-blue-700 text-sm mt-1">
                  You have already received your welcome bonus. Contact support if you need assistance.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleCreateWallet}
            disabled={creating || hasExistingWallet || hasWelcomeBonus}
            className="bg-rose-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
          >
            <Wallet className="w-5 h-5" />
            <span>
              {creating
                ? 'Creating Wallet...'
                : hasExistingWallet || hasWelcomeBonus
                ? 'Wallet Already Exists'
                : 'Create Wallet'}
            </span>
          </button>

          {(hasExistingWallet || hasWelcomeBonus) && (
            <p className="mt-4 text-sm text-gray-500">
              Each user can only create one wallet and claim the welcome bonus once.
            </p>
          )}
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'credit' || type === 'initial_credit') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Wallet className="w-8 h-8 mr-3 text-rose-600" />
          My Wallet
        </h1>
        <p className="text-gray-600">Manage your PadLink tokens and transaction history</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <span className="text-rose-100 font-semibold">Wallet Balance</span>
            <Wallet className="w-8 h-8 text-white opacity-80" />
          </div>
          <div className="text-5xl font-bold mb-2">{balance}</div>
          <div className="text-rose-100">PadLink Tokens</div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-semibold">Wallet Address</span>
            <LinkIcon className="w-6 h-6 text-rose-600" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 break-all font-mono text-sm text-gray-700 mb-4">
            {walletAddress}
          </div>
          <div className="text-xs text-gray-500">
            This is your unique blockchain identifier
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-rose-600" />
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 capitalize">
                      {transaction.transaction_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${getAmountColor(transaction.amount)}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-rose-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-2">About PadLink Tokens</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          PadLink tokens are used to reward donors and track donations on the blockchain. Every
          donation you make earns you tokens, which can be used within the platform. All transactions
          are recorded immutably on our blockchain for transparency and accountability.
        </p>
      </div>
    </div>
  );
}
