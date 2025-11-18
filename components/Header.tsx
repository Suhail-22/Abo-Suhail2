import React from 'react';
import Icon from './Icon';
import { TaxSettings } from '../types';

interface HeaderProps {
  taxSettings: TaxSettings;
  onToggleSettings: () => void;
  onShare: () => void;
  onToggleHistory: () => void;
  historyCount: number;
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

  // [MODIFIED] Simplification of Tax Label (Req. 5)
  const getTaxRateLabel = () => {
    if (!isEnabled) return '---';
    const displayRate = rate || 0;
    switch (mode) {
      case 'add-15': return '+15%';
      // [MODIFIED] تغيير التسمية لـ /0.93
      case 'divide-93': return '/0.93'; 
      case 'custom': return `+${displayRate}%`;
      case 'extract-custom': return `-${displayRate}%`;
      default: return `${displayRate}%`;
    }
  };
  
  // [NEW] Logic to display the total entries count icon
  const entryCountIcon = (
    <div className="relative">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-inset)] text-[var(--text-secondary)]" aria-label="عدد الإدخالات">
          <Icon name='entries' />
      </div>
      {/* هذا هو الرقم الأزرق الذي يعرض عدد الإدخالات الحالية */}
      {entryCountDisplay > 0 && <span className="absolute -top-1 -right-1.5 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">{entryCountDisplay > 99 ? '99+' : entryCountDisplay}</span>}
    </div>
  );

  return (
    <div className="flex justify-between items-center p-3 rounded-3xl mb-4 bg-[var(--bg-header)] border border-[var(--border-primary)] backdrop-blur-sm">
      
      {/* === الجانب الأيمن (Right Group) === */}
      {/* [MODIFIED] الترتيب الجديد: إعدادات (1) + عدد إدخالات (2) + سجل (3) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* 1. Settings Button (Rightmost position - تبديل) */}
        <HeaderButton onClick={onToggleSettings} aria-label="فتح الإعدادات"><Icon name='settings' /></HeaderButton>
        
        {/* 2. Entry Count Icon (Next to Settings - نقل) */}
        {entryCountIcon}
        
        {/* 3. History Button/Badge (After Entry Count) */}
        <div className="relative">
          <HeaderButton onClick={onToggleHistory} aria-label="فتح السجل"><Icon name='history' /></HeaderButton>
          {/* هذا هو الرقم الأحمر الذي يعرض العدد الكلي لسجل العمليات */}
          {historyCount > 0 && <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">{historyCount > 99 ? '99+' : historyCount}</span>}
        </div>
        
      </div>
      
      {/* === المركز (Center Tax Display) === */}
      {/* [MODIFIED] لضمان التوسيط بغض النظر عن حجم المجموعات الجانبية */}
      <div className="flex items-center justify-center flex-grow">
        <div className={`text-sm py-1 px-2.5 rounded-xl bg-[var(--bg-inset)] text-[var(--text-secondary)] whitespace-nowrap transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-60'} mx-auto`}>
          {/* [MODIFIED] توسيط كلمة 'الضريبة' */}
          <span className="font-bold">الضريبة:</span> <span className="font-bold text-[var(--text-primary)]">{getTaxRateLabel()}</span>
        </div>
      </div>

      {/* === الجانب الأيسر (Left Group) === */}
      {/* [MODIFIED] Share button (Leftmost position - تبديل) */}
      <div className="flex items-center flex-shrink-0">
        <HeaderButton onClick={onShare} aria-label="مشاركة النتيجة"><Icon name='share' /></HeaderButton>
      </div>

    </div>
  );
};

export default Header;
