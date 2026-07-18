import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  isDestructive = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-primary/50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-brand-bg w-full max-w-sm rounded-[16px] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-brand-primary/10">
          <div className="flex items-center gap-2 text-[#115E63] font-heading text-lg">
            {isDestructive && <AlertTriangle size={20} className="text-brand-accent" />}
            {title}
          </div>
          <button onClick={onClose} className="text-[#115E63] hover:bg-brand-primary/10 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-[#115E63]/80 font-body">
          {message}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-primary/10 bg-brand-peach/30 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] text-[#115E63] font-bold hover:bg-brand-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-[10px] font-bold transition-colors ${
              isDestructive 
                ? 'bg-brand-accent text-white hover:bg-brand-accent/90' 
                : 'bg-brand-primary text-[#115E63] hover:bg-brand-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
