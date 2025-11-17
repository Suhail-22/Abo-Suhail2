// components/Header.tsx
import React from 'react';
import { TaxSettings } from '../types';

interface HeaderProps {
  taxSettings: TaxSettings;
  onToggleSettings: () => void;
  onShare: () => void;
  onToggleHistory: () => void;
  historyCount: number; // العدد الإجمالي
  entryCountDisplay: number;
  // --- إضافة prop لعدد العمليات اليومية ---
  dailyCount: number;
  // --- النهاية ---
}

const Header: React.FC<HeaderProps> = ({ taxSettings, onToggleSettings, onShare, onToggleHistory, historyCount, entryCountDisplay, dailyCount }) => {
  return (
    <div className="flex justify-between items-center mb-3 px-1">
      <div className="flex gap-2">
        <button
          onClick={onToggleSettings}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
          aria-label="الإعدادات"
        >
          ⚙️
        </button>
        <button
          onClick={onShare}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
          aria-label="مشاركة"
        >
          ↗️
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-secondary)]">السجل</span>
          <span className="relative">
            <button
              onClick={onToggleHistory}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)] transition-all duration-200"
              aria-label="فتح السجل"
            >
              📜
            </button>
            {/* --- عرض عدد العمليات اليومية --- */}
            {dailyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] rounded-full h-4 w-4 flex items-center justify-center">
                {dailyCount}
              </span>
            )}
            {/* --- النهاية --- */}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-secondary)]">({historyCount})</span> {/* العدد الإجمالي */}
          <span className="text-xs text-[var(--text-secondary)]">({entryCountDisplay})</span>
        </div>
      </div>
    </div>
  );
};

export default Header;