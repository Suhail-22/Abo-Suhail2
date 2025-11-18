import React from 'react';
import Icon from './Icon';
import { TaxSettings } from '../types';

interface HeaderProps {
  taxSettings: TaxSettings;
  onToggleSettings: () => void;
  onShare: () => void;
  onToggleHistory: () => void;
  historyCount: number; // الآن يمثل عدد عمليات اليوم
  entryCountDisplay: number;
}

const HeaderButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
  <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-inset)] text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-inset-light)] hover:text-[var(--text-primary)]"
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ taxSettings, onToggleSettings, onShare, onToggleHistory, historyCount, entryCountDisplay }) => {
  const { isEnabled, rate, mode } = taxSettings;

  const getTaxRateLabel = () => {
    if (!isEnabled) return '---';
    const displayRate = rate || 0;
    switch (mode) {
      case 'add-15': return '+15%';
      case 'divide-93': return '/0.93'; 
      case 'custom': return `+${displayRate}%`;
      case 'extract-custom': return `-${displayRate}%`;
      default: return `${displayRate}%`;
    }
  };
  
  // أيقونة عدد الإدخالات (الأزرق)
  const entryCountIcon = (
    <div className="relative">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-inset)] text-[var(--text-secondary)]" aria-label="عدد الإدخالات">
          <Icon name='entries' />
      </div>
      {entryCountDisplay > 0 && <span className="absolute -top-1 -right-1.5 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">{entryCountDisplay > 99 ? '99+' : entryCountDisplay}</span>}
    </div>
  );
  
  // أيقونة السجل (الأحمر - يمثل عدد عمليات اليوم)
  const historyButtonWithBadge = (
    <div className="relative">
      <HeaderButton onClick={onToggleHistory} aria-label="فتح السجل"><Icon name='history' /></HeaderButton>
      {historyCount > 0 && <span className="absolute -top-1 -right-1.5 bg-red-500/80 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">{historyCount > 99 ? '99+' : historyCount}</span>}
    </div>
  );

  return (
    <div className="flex justify-between items-center p-3 rounded-3xl mb-4 bg-[var(--bg-header)] border border-[var(--border-primary)] backdrop-blur-sm">
      
      {/* === الجانب الأيمن (Right Group) === */}
      {/* الترتيب: إعدادات (1) + عدد إدخالات (2) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* 1. Settings Button */}
        <HeaderButton onClick={onToggleSettings} aria-label="فتح الإعدادات"><Icon name='settings' /></HeaderButton>
        
        {/* 2. Entry Count Icon */}
        {entryCountIcon}
        
      </div>
      
      {/* === المركز (Center Tax Display) === */}
      {/* تم توسيطه باستخدام mx-auto و flex-grow */}
      <div className="flex items-center justify-center flex-grow">
        <div className={`text-sm py-1 px-2.5 rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] whitespace-nowrap transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-60'} mx-auto`}>
          <span className="font-bold">الضريبة:</span> <span className="font-bold text-[var(--text-primary)]">{getTaxRateLabel()}</span>
        </div>
      </div>

      {/* === الجانب الأيسر (Left Group) === */}
      {/* الترتيب الجديد: سجل (1) + مشاركة (2) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* 1. History Button/Badge (الآن هو الأول) */}
        {historyButtonWithBadge}

        {/* 2. Share button (الآن هو الثاني) */}
        <HeaderButton onClick={onShare} aria-label="مشاركة النتيجة"><Icon name='share' /></HeaderButton>
      </div>

    </div>
  );
};

export default Header;
