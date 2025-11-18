// ButtonGrid.tsx
import React from 'react';

interface ButtonGridProps {
  onAppend: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  onParenthesis: () => void;
  onAppendAnswer: () => void;
  layout: string;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ 
  onAppend, 
  onClear, 
  onBackspace, 
  onCalculate, 
  onToggleSign, 
  onParenthesis, 
  onAppendAnswer, 
  layout 
}) => {
  // --- تعريف الأزرار حسب التخطيط ---
  const standardButtons = [
    { type: 'function', label: 'AC', onClick: onClear },
    { type: 'function', label: '±', onClick: onToggleSign },
    { type: 'function', label: '%', onClick: () => onAppend('%') },
    { type: 'operator', label: '÷', onClick: () => onAppend('÷') },
    { type: 'number', label: '7', onClick: () => onAppend('7') },
    { type: 'number', label: '8', onClick: () => onAppend('8') },
    { type: 'number', label: '9', onClick: () => onAppend('9') },
    { type: 'operator', label: '×', onClick: () => onAppend('×') },
    { type: 'number', label: '4', onClick: () => onAppend('4') },
    { type: 'number', label: '5', onClick: () => onAppend('5') },
    { type: 'number', label: '6', onClick: () => onAppend('6') },
    { type: 'operator', label: '-', onClick: () => onAppend('-') },
    { type: 'number', label: '1', onClick: () => onAppend('1') },
    { type: 'number', label: '2', onClick: () => onAppend('2') },
    { type: 'number', label: '3', onClick: () => onAppend('3') },
    { type: 'operator', label: '+', onClick: () => onAppend('+') },
    { type: 'number', label: '0', onClick: () => onAppend('0') },
    { type: 'number', label: '00', onClick: () => onAppend('00') },
    { type: 'number', label: '000', onClick: () => onAppend('000') },
    { type: 'equals', label: '=', onClick: onCalculate },
  ];

  const scientificButtons = [
    ...standardButtons,
    { type: 'function', label: '(', onClick: onParenthesis },
    { type: 'function', label: ')', onClick: onParenthesis },
    { type: 'function', label: 'Ans', onClick: onAppendAnswer },
    { type: 'function', label: '←', onClick: onBackspace },
  ];

  // --- اختيار الأزرار بناءً على التخطيط ---
  const buttons = layout === 'scientific' ? scientificButtons : standardButtons;

  // --- دالة لإنشاء زر ---
  const renderButton = (button: any, index: number) => {
    let className = 'w-full h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ';
    switch (button.type) {
      case 'number':
        className += 'bg-[var(--bg-number)] text-[var(--text-number)] hover:bg-[var(--bg-number-light)]';
        break;
      case 'operator':
        className += 'bg-[var(--bg-operator)] text-[var(--text-operator)] hover:bg-[var(--bg-operator-light)]';
        break;
      case 'function':
        className += 'bg-[var(--bg-function)] text-[var(--text-function)] hover:bg-[var(--bg-function-light)]';
        break;
      case 'equals':
        className += 'bg-[var(--accent-color)] text-[var(--accent-color-contrast)] hover:bg-[var(--accent-color-light)]';
        break;
      default:
        className += 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset-light)]';
    }

    return (
      <button
        key={index}
        onClick={button.onClick}
        className={className}
        aria-label={button.label}
      >
        {button.label}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.isArray(buttons) ? buttons.map(renderButton) : <div>Loading...</div>}
    </div>
  );
};

export default ButtonGrid;