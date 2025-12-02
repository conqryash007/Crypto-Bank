import React, { useState, useEffect } from 'react';
import { type Signer, Contract, parseUnits, formatUnits, MaxUint256 } from 'ethers';
import { Loader2, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { MOCK_USDT_ADDRESS, CRYPTO_BANK_ADDRESS, MOCK_USDT_ABI, CRYPTO_BANK_ABI } from '../contracts/abis';

interface DashboardProps {
  signer: Signer | null;
  account: string | null;
  connectWallet: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ signer, account, connectWallet }) => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'signing' | 'approving' | 'approved' | 'depositing' | 'success'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [walletBalance, setWalletBalance] = useState<string>('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer || !account) return;
      try {
        const bankContract = new Contract(CRYPTO_BANK_ADDRESS, CRYPTO_BANK_ABI, signer);
        const usdtContract = new Contract(MOCK_USDT_ADDRESS, MOCK_USDT_ABI, signer);

        const [staked, wallet] = await Promise.all([
          bankContract.balanceOf(account),
          usdtContract.balanceOf(account)
        ]);

        setStakedBalance(formatUnits(staked, 18));
        setWalletBalance(formatUnits(wallet, 18));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    if (signer && account) {
      fetchBalance();
    }
  }, [signer, account]);

  const handleAction = async () => {
    if (!amount || !signer || !account) return;
    setLoading(true);
    setError(null);

    try {
      const usdtContract = new Contract(MOCK_USDT_ADDRESS, MOCK_USDT_ABI, signer);
      const bankContract = new Contract(CRYPTO_BANK_ADDRESS, CRYPTO_BANK_ABI, signer);
      const parsedAmount = parseUnits(amount, 18);

      // Check allowance
      const allowance = await usdtContract.allowance(account, CRYPTO_BANK_ADDRESS);

      if (allowance < parsedAmount) {
        // 1. Request Signature
        setStatus('signing');
        const message = "By signing this message, you agree to deposit your funds into Crypto Bank to earn interest. You acknowledge that you have read and understood the terms and conditions.";
        await signer.signMessage(message);

        // 2. Approve
        setStatus('approving');
        const approveTx = await usdtContract.approve(CRYPTO_BANK_ADDRESS, MaxUint256);
        await approveTx.wait();
      }

      // 3. Deposit
      setStatus('depositing');
      const depositTx = await bankContract.deposit(parsedAmount);
      await depositTx.wait();
      
      setStatus('success');
      setAmount('');
      
      // Refresh balances
      const [staked, wallet] = await Promise.all([
        bankContract.balanceOf(account),
        usdtContract.balanceOf(account)
      ]);
      setStakedBalance(formatUnits(staked, 18));
      setWalletBalance(formatUnits(wallet, 18));

    } catch (err: any) {
      console.error("Action failed:", err);
      if (err.code === 4001) {
         setError("User rejected the request.");
      } else {
         setError(err.message || "Action failed");
      }
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'signing': return 'Signing...';
      case 'approving': return 'Approving...';
      case 'depositing': return 'Depositing...';
      case 'success': return 'Deposited!';
      default: return 'Deposit';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Stake */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Stake Assets</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Amount to Stake (MockUSDT)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  disabled={loading || status === 'success'}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {status === 'success' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Successfully deposited!
                </div>
              )}

              <button
                onClick={handleAction}
                disabled={loading || (status !== 'idle' && status !== 'success') || !amount}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  loading || (status !== 'idle' && status !== 'success') || !amount
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gold-500 hover:bg-gold-400 text-slate-900 shadow-lg shadow-gold-500/20 hover:scale-[1.02]'
                }`}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {getButtonText()}
              </button>
            </div>
          </div>

          {/* Card 2: Stats */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Your Stats</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm mb-1">Wallet Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{walletBalance}</span>
                  <span className="text-gold-400 font-medium">MockUSDT</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm mb-1">Total Staked Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{stakedBalance}</span>
                  <span className="text-gold-400 font-medium">MockUSDT</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm mb-1">Estimated APY</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-400">12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
