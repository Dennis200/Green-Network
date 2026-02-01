
import React, { useState } from 'react';
import { ArrowLeft, Plus, History, CreditCard, ArrowUpRight, ArrowDownLeft, Sprout, X, DollarSign, Wallet as WalletIcon, CheckCircle } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { formatCurrency } from '../utils';

interface WalletProps {
    onBack: () => void;
}

const Wallet: React.FC<WalletProps> = ({ onBack }) => {
    const [balance, setBalance] = useState(CURRENT_USER.walletBalance || 0);
    const [showTopUp, setShowTopUp] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    
    // Mock Transactions
    const [transactions, setTransactions] = useState([
        { id: 1, title: 'Purchased Seeds', date: 'Oct 24, 2024', amount: -250, type: 'spend' },
        { id: 2, title: 'Sold: LED Light', date: 'Oct 22, 2024', amount: 1200, type: 'earn' },
        { id: 3, title: 'Top Up', date: 'Oct 20, 2024', amount: 500, type: 'deposit' },
        { id: 4, title: 'Ad Campaign', date: 'Oct 15, 2024', amount: -150, type: 'spend' },
    ]);

    const handleTopUp = (amount: number) => {
        setBalance(prev => prev + amount);
        setTransactions(prev => [{
            id: Date.now(),
            title: 'Top Up',
            date: 'Just now',
            amount: amount,
            type: 'deposit'
        }, ...prev]);
        setShowTopUp(false);
    }

    const handleWithdraw = (amount: number) => {
        if(amount > balance) return alert("Insufficient funds");
        setBalance(prev => prev - amount);
        setTransactions(prev => [{
            id: Date.now(),
            title: 'Withdrawal',
            date: 'Just now',
            amount: -amount,
            type: 'spend'
        }, ...prev]);
        setShowWithdraw(false);
    }

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {/* Top Up Modal */}
            {showTopUp && (
                <TopUpModal onClose={() => setShowTopUp(false)} onConfirm={handleTopUp} />
            )}

            {/* Withdraw Modal */}
            {showWithdraw && (
                <WithdrawModal onClose={() => setShowWithdraw(false)} onConfirm={handleWithdraw} maxAmount={balance} />
            )}

            <div className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Wallet</h1>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-8">
                
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-900 to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gsn-green/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 text-center">
                        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-2">Total Balance</p>
                        <h2 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                            <Sprout size={32} className="text-gsn-green" /> {balance.toLocaleString()}
                        </h2>
                        <p className="text-zinc-500 text-sm">~ {formatCurrency(balance * 0.01)} USD</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button 
                            onClick={() => setShowTopUp(true)}
                            className="bg-gsn-green text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <Plus size={18} /> Top Up
                        </button>
                        <button 
                            onClick={() => setShowWithdraw(true)}
                            className="bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-white/10"
                        >
                            <ArrowUpRight size={18} /> Withdraw
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <History size={20} className="text-zinc-400" /> Recent Activity
                    </h3>
                    <div className="bg-zinc-900 rounded-2xl border border-white/5 divide-y divide-white/5">
                        {transactions.map(tx => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'spend' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {tx.type === 'spend' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{tx.title}</p>
                                        <p className="text-zinc-500 text-xs">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font-bold font-mono ${tx.amount > 0 ? 'text-gsn-green' : 'text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopUpModal = ({ onClose, onConfirm }: { onClose: () => void, onConfirm: (amt: number) => void }) => {
    const [amount, setAmount] = useState('100');
    const [method, setMethod] = useState<'card' | 'crypto'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onConfirm(parseInt(amount));
            setIsProcessing(false);
        }, 2000);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 w-full max-w-sm rounded-3xl border border-white/10 p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-black text-white mb-6">Top Up Balance</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Amount (Seeds)</label>
                        <div className="relative">
                            <Sprout className="absolute left-4 top-3.5 text-gsn-green" size={20} />
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white text-lg font-bold focus:border-gsn-green focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 text-right">Cost: {formatCurrency(parseInt(amount || '0') * 0.01)} USD</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setMethod('card')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'bg-gsn-green/10 border-gsn-green text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                            >
                                <CreditCard size={24} />
                                <span className="text-xs font-bold">Card</span>
                            </button>
                            <button 
                                onClick={() => setMethod('crypto')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'crypto' ? 'bg-gsn-green/10 border-gsn-green text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                            >
                                <WalletIcon size={24} />
                                <span className="text-xs font-bold">Crypto</span>
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        disabled={isProcessing || !amount}
                        className="w-full bg-gsn-green text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const WithdrawModal = ({ onClose, onConfirm, maxAmount }: { onClose: () => void, onConfirm: (amt: number) => void, maxAmount: number }) => {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = () => {
        if (!address) return alert("Please enter a valid address");
        setIsProcessing(true);
        setTimeout(() => {
            onConfirm(parseInt(amount));
            setIsProcessing(false);
        }, 2000);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 w-full max-w-sm rounded-3xl border border-white/10 p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-black text-white mb-6">Withdraw Funds</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Amount (Seeds)</label>
                        <div className="relative">
                            <Sprout className="absolute left-4 top-3.5 text-gsn-green" size={20} />
                            <input 
                                type="number" 
                                value={amount}
                                max={maxAmount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white text-lg font-bold focus:border-gsn-green focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 text-right">Available: {maxAmount}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Crypto Wallet Address</label>
                        <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-gsn-green focus:outline-none font-mono"
                        />
                    </div>

                    <button 
                        onClick={handleConfirm}
                        disabled={isProcessing || !amount || !address}
                        className="w-full bg-zinc-100 text-black font-black py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Withdraw Now'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Wallet;
