// components/Header.tsx
import React from 'react';
import { TaxSettings } from '../types';

interface HeaderProps {
  taxSettings: TaxSettings;
  onToggleSettings: () => void;
  onShare: () => void;
  onToggleHistory: () => void;
  entryCountDisplay: number;
  dailyCount: number;
}

const getTaxModeLabel = (taxSettings: TaxSettings): string => {
  if (!taxSettings.isEnabled) return '';
  switch (taxSettings.mode) {
    case 'add-15':
      return 'ضريبة: +15%';
    case 'extract-custom':
      return `ضريبة: -${taxSettings.rate}%`;
    case 'divide-93':
      return 'ضريبة: ÷0.93';
    case 'custom':
      return `ضريبة: +${taxSettings.rate}%`;
    default:
      return '';
  }
};

const Header: React.FC<HeaderProps> = ({ 
  taxSettings, 
  onToggleSettings, 
  onShare, 
  onToggleHistory, 
  entryCountDisplay, 
  dailyCount 
}) => {
  const taxLabel = getTaxModeLabel(taxSettings);

  // --- دالة لإنشاء عنصر رمز مع عدد ---
  const IconWithBadge = ({ icon, count }: { icon: string; count: number }) => (
    <div className="relative inline-flex">
      <span className="text-lg">{icon}</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] rounded-full h-4 w-4 flex items-center justify-center shadow-md animate-fade-in-down">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {/* --- شريط عرض الضريبة --- */}
      {taxLabel && (
        <div className="flex justify-center mb-1">
          <span className="text-xs font-bold text-orange-400 animate-fade-in-down">
            {taxLabel}
          </span>
        </div>
      )}

      {/* --- شريط الأزرار (الترتيب النهائي) --- */}
      <div className="flex justify-between items-center px-1">
        
        {/* --- الجانب الأيسر: مشاركة ← الإدخالات --- */}
        <div className="flex items-center gap-3">
          {/* --- زر المشاركة --- */}
          <button
            onClick={onShare}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
            aria-label="مشاركة"
          >
            📤
          </button>

          {/* --- الإدخالات --- */}
          <IconWithBadge icon="🔢" count={entryCountDisplay} />
        </div>

        {/* --- الجانب الأيمن: السجل ← الإعدادات --- */}
        <div className="flex items-center gap-2">
          
          {/* --- السجل مع العدد --- */}
          <div className="relative">
            <button
              onClick={onToggleHistory}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
              aria-label="فتح السجل"
            >
              <IconWithBadge icon="📜" count={dailyCount} />
            </button>
          </div>

          {/* --- الإعدادات --- */}
          <button
            onClick={onToggleSettings}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
            aria-label="الإعدادات"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;