import { useState, useEffect } from 'react';
import { BlockchainManager } from '../../services/blockchainManager';
import { Block } from '../../services/blockchain';
import { Shield, CheckCircle, XCircle, Clock, User, Package, Link as LinkIcon } from 'lucide-react';

export function BlockchainViewer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    lastVerifiedBlock: number;
    error?: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const loadBlockchain = async () => {
    setLoading(true);
    try {
      const allBlocks = await BlockchainManager.getAllBlocks();
      setBlocks(allBlocks);
    } catch (error) {
      console.error('Error loading blockchain:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchain();
  }, []);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const result = await BlockchainManager.verifyChainIntegrity();
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying chain:', error);
    } finally {
      setVerifying(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-rose-600" />
              Blockchain Ledger
            </h1>
            <p className="text-gray-600">Transparent and immutable donation records</p>
          </div>
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            <span>{verifying ? 'Verifying...' : 'Verify Chain'}</span>
          </button>
        </div>

        {verificationResult && (
          <div
            className={`mt-4 p-4 rounded-lg border-2 ${
              verificationResult.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {verificationResult.isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className={`font-semibold ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {verificationResult.isValid ? 'Blockchain Integrity Verified' : 'Blockchain Integrity Failed'}
                </p>
                <p className={`text-sm ${verificationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  Total Blocks: {verificationResult.totalBlocks} | Last Verified Block: #{verificationResult.lastVerifiedBlock}
                  {verificationResult.error && ` | Error: ${verificationResult.error}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{blocks.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Blocks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {blocks.filter(b => b.data.transactionType === 'created').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Donations Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {blocks.filter(b => b.data.transactionType === 'reserved').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Donations Reserved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {blocks.reduce((sum, b) => sum + (b.data.quantity || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Pads Tracked</div>
          </div>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No blocks yet</h3>
          <p className="text-gray-600">The blockchain will be initialized with the first donation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.slice().reverse().map((block, index) => (
            <div
              key={block.hash}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-rose-100 p-3 rounded-lg">
                      <LinkIcon className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Block #{block.index}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(block.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(block.data.transactionType)}`}>
                    {block.data.transactionType}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-2 text-rose-600" />
                        <span className="font-semibold">Donor:</span>
                        <span className="ml-2">{block.data.donorName}</span>
                      </div>
                      {block.data.recipientName && (
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="w-4 h-4 mr-2 text-rose-600" />
                          <span className="font-semibold">Recipient:</span>
                          <span className="ml-2">{block.data.recipientName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <Package className="w-4 h-4 mr-2 text-rose-600" />
                        <span className="font-semibold">Quantity:</span>
                        <span className="ml-2">{block.data.quantity} pads</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Type:</span>
                        <span className="ml-2">{block.data.padType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Description:</span>
                    <span className="ml-2">{block.data.description}</span>
                  </div>

                  <button
                    onClick={() => setSelectedBlock(selectedBlock?.hash === block.hash ? null : block)}
                    className="text-rose-600 hover:text-rose-700 text-sm font-semibold"
                  >
                    {selectedBlock?.hash === block.hash ? 'Hide Technical Details' : 'View Technical Details'}
                  </button>

                  {selectedBlock?.hash === block.hash && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs font-mono">
                      <div className="break-all">
                        <span className="font-semibold text-gray-700">Hash:</span>
                        <div className="text-gray-600 mt-1 bg-white p-2 rounded">{block.hash}</div>
                      </div>
                      <div className="break-all">
                        <span className="font-semibold text-gray-700">Previous Hash:</span>
                        <div className="text-gray-600 mt-1 bg-white p-2 rounded">{block.previousHash}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Nonce:</span>
                        <span className="text-gray-600 ml-2">{block.nonce}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Transaction ID:</span>
                        <div className="text-gray-600 mt-1 bg-white p-2 rounded">{block.data.id}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
