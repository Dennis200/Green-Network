
import React, { useState } from 'react';
import { X, ChevronRight, AlertTriangle, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';

export type ReportType = 'Post' | 'User' | 'Community' | 'Message' | 'Comment' | 'Listing';

interface ReportModalProps {
    type: ReportType;
    targetId: string; // The ID of the item being reported
    onClose: () => void;
}

const REPORT_REASONS: Record<ReportType, string[]> = {
    'Post': [
        'Spam or Bot Activity',
        'Sale of Prohibited Items',
        'Nudity or Sexual Content',
        'Harassment or Hate Speech',
        'Misinformation',
        'Scam or Fraud',
        'Intellectual Property Violation',
        'Other'
    ],
    'User': [
        'Fake Account / Impersonation',
        'Posting Inappropriate Content',
        'Harassment or Bullying',
        'Scammer / Fraudulent Seller',
        'Underage User (<21)',
        'Other'
    ],
    'Community': [
        'Promotes Illegal Acts',
        'Hate Speech or Extremism',
        'Unmoderated Spam',
        'Impersonation of Official Brand',
        'Other'
    ],
    'Message': [
        'Unwanted Solicitation',
        'Harassment',
        'Threats of Violence',
        'Scam Attempt',
        'Other'
    ],
    'Comment': [
        'Spam',
        'Harassment',
        'Hate Speech',
        'Bad Vibes / Trolling',
        'Other'
    ],
    'Listing': [
        'Prohibited Item',
        'Counterfeit Item',
        'Scam / No Intent to Sell',
        'Wrong Category',
        'Price Gouging',
        'Other'
    ]
};

const ReportModal: React.FC<ReportModalProps> = ({ type, targetId, onClose }) => {
    const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setStep('success');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-zinc-900 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    {step === 'details' ? (
                        <button onClick={() => setStep('reason')} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <div className="w-9" />
                    )}
                    
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-500" />
                        Report {type}
                    </h3>
                    
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    
                    {step === 'reason' && (
                        <div className="space-y-2 animate-in slide-in-from-right duration-300">
                            <p className="text-zinc-400 text-sm mb-4 font-medium px-2">
                                Please select the reason that best describes why you are reporting this {type.toLowerCase()}.
                            </p>
                            {REPORT_REASONS[type].map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => {
                                        setSelectedReason(reason);
                                        setStep('details');
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 transition-all group text-left"
                                >
                                    <span className="font-bold text-sm text-zinc-200 group-hover:text-white">{reason}</span>
                                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
                                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white font-bold text-sm mb-1">{selectedReason}</p>
                                    <p className="text-zinc-400 text-xs">Help our moderation team by providing additional context.</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Additional Details (Optional)</label>
                                <textarea 
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Describe the issue..."
                                    className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 min-h-[120px] resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>Submit Report</>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300 text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Report Received</h2>
                            <p className="text-zinc-400 text-sm max-w-xs mb-8">
                                Thank you for keeping Green Stoners Network safe. We will review this {type.toLowerCase()} shortly.
                            </p>
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
