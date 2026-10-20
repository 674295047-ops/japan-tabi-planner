import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'ยืนยันการทำรายการ',
  message,
  confirmLabel = 'ยืนยันการลบ',
  cancelLabel = 'ยกเลิก',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
        };
      case 'primary':
        return {
          iconBg: 'bg-indigo-100 text-indigo-600',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
        };
      case 'danger':
      default:
        return {
          iconBg: 'bg-rose-100 text-rose-600',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleUp p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl ${variantStyles.iconBg} flex items-center justify-center mb-4 shadow-inner`}>
            {confirmVariant === 'danger' ? (
              <Trash2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <h3 className={`text-xl font-bold text-slate-900 ${message ? 'mb-2' : 'mb-6'}`}>{title}</h3>
          {message && (
            <p className="text-sm text-slate-600 leading-relaxed mb-6 px-2">{message}</p>
          )}

          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold shadow-md transition-all ${variantStyles.btnBg}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
