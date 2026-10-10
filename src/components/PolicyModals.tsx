import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { SystemConfig } from '../types';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'refund' | 'contact' | null;
  config?: SystemConfig;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, config, onClose }) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!type) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#15151D] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="h-16 px-6 bg-[#1C1C26] border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
            {type === 'privacy' && 'Privacy Policy'}
            {type === 'terms' && 'Terms of Service'}
            {type === 'refund' && 'Refund & Cancellation Policy'}
            {type === 'contact' && 'Contact Support'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed space-y-4">
          {type === 'privacy' && (
            <>
              <p>
                At Forge Fitness, we respect your right to personal data ownership and strict privacy.
                This Privacy Policy explains our practices regarding your workout telemetry, body metrics, and account credentials.
              </p>
              <h4 className="font-bold text-white text-sm">1. Data We Collect</h4>
              <p>
                We store account credentials, selected workout preferences, logged weights, repetitions, and optional body circumferences.
                All records are strictly private to your authenticated account and are never sold or shared with third-party advertisers.
              </p>
              <h4 className="font-bold text-white text-sm">2. Data Security & Storage</h4>
              <p>
                We enforce server-level role authorization. Passwords and payment tokens are handled with standard cryptographic hashing and tokenized gateways.
              </p>
              <h4 className="font-bold text-white text-sm">3. Right to Data Portability & Deletion</h4>
              <p>
                You can export your complete history at any time via the Profile settings tab in standard JSON format.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                Please read these terms carefully before utilizing Forge Fitness training programs and session logging software.
              </p>
              <h4 className="font-bold text-white text-sm">1. Physical Health & Medical Clearance</h4>
              <p>
                Heavy resistance training carries inherent physical exertion. Always consult with a qualified physician before commencing any physical regimen. Forge Fitness provides exercise guides for instructional purposes only.
              </p>
              <h4 className="font-bold text-white text-sm">2. Subscription & Trial Conditions</h4>
              <p>
                New accounts receive a complimentary 7-day trial. Following the trial period, access to active program logging requires an active monthly subscription. You may cancel auto-renewal at any time.
              </p>
            </>
          )}

          {type === 'refund' && (
            <>
              <p>
                We believe in full transparency and fair customer satisfaction.
              </p>
              <h4 className="font-bold text-white text-sm">1. 7-Day Unconditional Free Trial</h4>
              <p>
                You will never be charged before your 7-day free trial ends. There are no automatic stealth fees or surprise billings.
              </p>
              <h4 className="font-bold text-white text-sm">2. 14-Day Satisfaction Guarantee</h4>
              <p>
                If you subscribe and are unsatisfied with your training experience for any technical or service reason, contact our support team within 14 days of billing for a full refund.
              </p>
            </>
          )}

          {type === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#1C1C26] rounded-xl border border-white/5 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#FF6B35]" />
                  <div>
                    <span className="text-[10px] text-[#A1A1AA] block">Direct Email</span>
                    <span className="text-white font-bold">{config?.contactEmail || 'support@forgefitness.com'}</span>
                  </div>
                </div>
                <div className="p-3 bg-[#1C1C26] rounded-xl border border-white/5 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#FF6B35]" />
                  <div>
                    <span className="text-[10px] text-[#A1A1AA] block">Support Line</span>
                    <span className="text-white font-bold">{config?.contactPhone || '+1 (800) 555-FORGE'}</span>
                  </div>
                </div>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmitTicket} className="space-y-3 pt-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Submit Support Ticket</h4>
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Question about Push Pull Legs split"
                      className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={ticketBody}
                      onChange={(e) => setTicketBody(e.target.value)}
                      placeholder="Describe your inquiry..."
                      className="w-full bg-[#1C1C26] border border-white/10 rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
                  >
                    Submit Ticket
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-sm">Ticket Received!</p>
                  <p className="text-xs text-[#A1A1AA]">Our athletic coaching team will respond within 24 hours.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 px-6 bg-[#1C1C26] border-t border-white/5 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#15151D] hover:bg-[#252533] text-white text-xs font-bold rounded-xl border border-white/10 min-h-[40px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
