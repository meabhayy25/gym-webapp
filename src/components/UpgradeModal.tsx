import React, { useState } from 'react';
import { X, CreditCard, Sparkles, CheckCircle2, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Subscription } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, subscription, updateSubscription } = useAuth();
  const [provider, setProvider] = useState<'razorpay_test' | 'card_test'>('razorpay_test');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const price = subscription?.price || 19.99;
  const currency = subscription?.currency || 'USD';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate real provider token generation
      const testToken = `PAY_${provider.toUpperCase()}_${Date.now()}`;
      const res = await api.upgradeSubscription({
        providerToken: testToken,
        provider
      });

      updateSubscription(res.subscription);
      setReceipt(res.receipt);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#15151D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {!receipt ? (
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
                Full Membership Access
              </span>
              <h2 className="font-display text-2xl font-bold text-white mt-1">
                ACTIVATE PRO MEMBERSHIP
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Unlock full unlimited access to all 5 periodized programs, session logging, and progress charts.
              </p>
            </div>

            {/* Plan Details Card */}
            <div className="bg-[#1C1C26] rounded-xl p-4 border border-white/5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Monthly Unlimited Pass</p>
                <p className="text-xs text-[#A1A1AA]">Cancel anytime from settings</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#FF6B35]">
                  {currency === 'USD' ? '$' : '₹'}{price}
                </p>
                <p className="text-[10px] text-[#A1A1AA]">/ month</p>
              </div>
            </div>

            {/* Payment Provider Selection */}
            <div className="mb-4 space-y-2">
              <label className="block text-xs font-semibold text-white/80">
                Payment Provider Integration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('razorpay_test')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left min-h-[48px] ${
                    provider === 'razorpay_test'
                      ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-white'
                      : 'bg-[#1C1C26] border-white/10 text-[#A1A1AA]'
                  }`}
                >
                  <span>Razorpay Standard</span>
                  <span className="block text-[10px] text-[#A1A1AA] font-normal">UPI / Cards / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('card_test')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left min-h-[48px] ${
                    provider === 'card_test'
                      ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-white'
                      : 'bg-[#1C1C26] border-white/10 text-[#A1A1AA]'
                  }`}
                >
                  <span>Direct Card Payment</span>
                  <span className="block text-[10px] text-[#A1A1AA] font-normal">Encrypted Tokenization</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Card Number (Test Simulation)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Expires</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#1C1C26] rounded-xl border border-white/5 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-bit server-side tokenized verification. No raw card storage.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
              >
                <span>{loading ? 'Verifying with Provider...' : `Pay ${currency === 'USD' ? '$' : '₹'}${price} & Activate`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Payment Success Receipt */
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-display text-2xl font-bold text-white">MEMBERSHIP ACTIVATED!</h3>
            <p className="text-xs text-[#A1A1AA]">
              Your payment has been verified on the server. Your pro membership is now active.
            </p>

            <div className="bg-[#1C1C26] rounded-xl p-4 border border-white/5 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Transaction Reference:</span>
                <span className="font-mono text-white">{receipt.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Plan:</span>
                <span className="font-bold text-white">{receipt.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Amount Charged:</span>
                <span className="font-bold text-emerald-400">${receipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Provider:</span>
                <span className="text-white capitalize">{receipt.provider.replace('_', ' ')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReceipt(null);
                onClose();
              }}
              className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md min-h-[44px]"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
