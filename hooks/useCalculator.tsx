// hooks/useCalculator.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { CalculatorState, HistoryItem, TaxMode, TaxSettings } from '../types';

export const useCalculator = ({ showNotification }: { showNotification: (message: string) => void }) => {
  // --- الحالة الأساسية ---
  const [state, setState] = useState<CalculatorState>({
    currentInput: '0',
    expression: '',
    result: '',
    tax: '',
    taxDisplay: '',
    taxMode: 'off',
    taxRate: 0,
    customTax: 0,
    taxType: 'addition', // ← إضافة هذا الحقل لدعم "إضافة" أو "خصم"
    history: [],
    theme: 'classic',
    showSettings: false,
    showHistory: false,
    showAbout: false,
    showSupport: false,
    showConfirmation: false,
    confirmationMessage: '',
    onConfirm: () => {},
    editableIndex: -1,
    inlineEditorValue: '',
    isEditing: false,
    aiSuggestion: '',
    showAISuggestion: false,
    lastCalculatedResult: null,
  });

  // --- استرجاع الإعدادات من localStorage ---
  const [taxSettings, setTaxSettings] = useLocalStorage<TaxSettings>('taxSettings_v3', {
    isEnabled: false,
    mode: 'add-15',
    rate: 15,
    showTaxPerNumber: false,
  });

  const [buttonLayout, setButtonLayout] = useLocalStorage<string>('buttonLayout_v1', 'standard');
  const [maxHistory, setMaxHistory] = useLocalStorage<number>('maxHistory_v1', 100);

  // --- تطبيق الإعدادات على الحالة ---
  useEffect(() => {
    setState(prev => ({
      ...prev,
      taxSettings,
      buttonLayout,
      maxHistory,
    }));
  }, [taxSettings, buttonLayout, maxHistory]);

  // --- وظائف التحكم ---
  const actions = {
    updateInput: useCallback((value: string) => {
      setState(prev => ({
        ...prev,
        currentInput: value,
        error: '',
        aiSuggestion: '',
        showAISuggestion: false,
      }));
    }, []),

    append: useCallback((char: string) => {
      setState(prev => {
        let newInput = prev.currentInput;
        if (prev.currentInput === '0' && !['+', '-', '×', '÷', '%', '(', ')'].includes(char)) {
          newInput = char;
        } else if (prev.currentInput === '0' && ['+', '-', '×', '÷', '%', '(', ')'].includes(char)) {
          newInput = char;
        } else {
          newInput = prev.currentInput + char;
        }

        return {
          ...prev,
          currentInput: newInput,
          error: '',
          aiSuggestion: '',
          showAISuggestion: false,
        };
      });
    }, []),

    clearAll: useCallback(() => {
      setState(prev => ({
        ...prev,
        currentInput: '0',
        expression: '',
        result: '',
        tax: '',
        taxDisplay: '',
        error: '',
        aiSuggestion: '',
        showAISuggestion: false,
      }));
    }, []),

    backspace: useCallback(() => {
      setState(prev => {
        let newInput = prev.currentInput;
        if (newInput.length === 1 || (newInput.length === 2 && newInput.startsWith('-'))) {
          newInput = '0';
        } else {
          newInput = newInput.slice(0, -1);
        }
        return {
          ...prev,
          currentInput: newInput,
          error: '',
          aiSuggestion: '',
          showAISuggestion: false,
        };
      });
    }, []),

    toggleSign: useCallback(() => {
      setState(prev => {
        let newInput = prev.currentInput;
        if (newInput === '0') return prev;
        if (newInput.startsWith('-')) {
          newInput = newInput.slice(1);
        } else {
          newInput = '-' + newInput;
        }
        return {
          ...prev,
          currentInput: newInput,
        };
      });
    }, []),

    handleParenthesis: useCallback(() => {
      setState(prev => {
        if (prev.currentInput === '0') {
          return {
            ...prev,
            currentInput: '(',
          };
        }

        const lastChar = prev.currentInput.slice(-1);
        const isOpening = prev.currentInput.split('(').length > prev.currentInput.split(')').length;

        if (lastChar === '(' || lastChar === '+' || lastChar === '-' || lastChar === '×' || lastChar === '÷') {
          return {
            ...prev,
            currentInput: prev.currentInput + '(',
          };
        } else if (lastChar === ')' || (/[0-9]/.test(lastChar) && !isOpening)) {
          return {
            ...prev,
            currentInput: prev.currentInput + ')',
          };
        } else {
          return prev;
        }
      });
    }, []),

    appendAnswer: useCallback(() => {
      setState(prev => {
        if (!prev.result) return prev;
        return {
          ...prev,
          currentInput: prev.result,
          error: '',
          aiSuggestion: '',
          showAISuggestion: false,
        };
      });
    }, []),

    calculate: useCallback(() => {
      setState(prev => {
        const input = prev.currentInput;
        if (!input) return prev;

        let expression = input;
        let result = '';
        let taxValue = 0;
        let finalResult = 0;
        let taxDisplay = '';

        try {
          // استبدال الرموز
          const safeExpr = input
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/%/g, '/100');

          // تقييم التعبير
          const evaluatedResult = eval(safeExpr);

          if (isNaN(evaluatedResult) || !isFinite(evaluatedResult)) {
            throw new Error('نتيجة غير صالحة');
          }

          result = evaluatedResult.toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: false });

          // حساب الضريبة
          if (prev.taxSettings.isEnabled && prev.taxSettings.rate > 0) {
            if (prev.taxSettings.mode === 'extract-custom') {
              // استخلاص الضريبة: القيمة الأصلية = الناتج / (1 - النسبة/100)
              // مثال: 100 - 7% = 100 / 0.93 ≈ 107.53
              // لكن هنا: الناتج هو 100، ونريد إظهار: 107.53 (القيمة الأصلية) ثم 100 (بعد الخصم)
              // لذا: نحسب القيمة الأصلية، ثم نطرح منها الضريبة
              const originalAmount = evaluatedResult / (1 - prev.taxSettings.rate / 100);
              taxValue = originalAmount - evaluatedResult;
              finalResult = evaluatedResult; // الناتج النهائي بعد الخصم
              taxDisplay = `-${taxValue.toFixed(2)} (${prev.taxSettings.rate}%)`;
            } else if (prev.taxSettings.mode === 'divide-93') {
              // القسمة على 0.93 = استخلاص 7% (أي 100 ÷ 0.93 = 107.53)
              const originalAmount = evaluatedResult / 0.93;
              taxValue = originalAmount - evaluatedResult;
              finalResult = evaluatedResult;
              taxDisplay = `-${taxValue.toFixed(2)} (7%)`;
            } else if (prev.taxSettings.mode === 'custom') {
              // إضافة نسبة مخصصة
              taxValue = evaluatedResult * (prev.taxSettings.rate / 100);
              finalResult = evaluatedResult + taxValue;
              taxDisplay = `+${taxValue.toFixed(2)} (${prev.taxSettings.rate}%)`;
            } else if (prev.taxSettings.mode === 'add-15') {
              // إضافة 15%
              taxValue = evaluatedResult * 0.15;
              finalResult = evaluatedResult + taxValue;
              taxDisplay = `+${taxValue.toFixed(2)} (15%)`;
            } else {
              // لا شيء
              finalResult = evaluatedResult;
            }
          } else {
            finalResult = evaluatedResult;
          }

          // تكوين السجل
          const newHistoryItem: HistoryItem = {
            id: Date.now(),
            expression: input,
            result: result,
            date: new Date().toLocaleDateString('ar-EG'),
            time: new Date().toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            taxMode: prev.taxSettings.mode,
            taxRate: prev.taxSettings.rate,
            taxResult: prev.taxSettings.isEnabled ? finalResult.toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: false }) : '',
            taxLabel: taxDisplay,
            notes: '',
          };

          // تحديث السجل
          let newHistory = [...prev.history];
          if (newHistory.length >= prev.maxHistory) {
            newHistory = newHistory.slice(1);
          }
          newHistory = [newHistoryItem, ...newHistory];

          return {
            ...prev,
            expression: input,
            result: finalResult.toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: false }),
            tax: taxValue.toFixed(2),
            taxDisplay,
            currentInput: finalResult.toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: false }),
            history: newHistory,
            lastCalculatedResult: finalResult,
            error: '',
            aiSuggestion: '',
            showAISuggestion: false,
          };
        } catch (e) {
          console.error('Error evaluating expression:', e);
          return {
            ...prev,
            error: 'خطأ في التعبير',
            aiSuggestion: '',
            showAISuggestion: false,
          };
        }
      });
    }, []),

    clearHistory: useCallback(() => {
      setState(prev => ({
        ...prev,
        history: [],
      }));
    }, []),

    deleteHistoryItem: useCallback((id: number) => {
      setState(prev => ({
        ...prev,
        history: prev.history.filter(item => item.id !== id),
      }));
    }, []),

    loadFromHistory: useCallback((expression: string) => {
      setState(prev => ({
        ...prev,
        currentInput: expression,
        expression: '',
        result: '',
        tax: '',
        taxDisplay: '',
        error: '',
        aiSuggestion: '',
        showAISuggestion: false,
      }));
    }, []),

    updateHistoryItemNote: useCallback((id: number, note: string) => {
      setState(prev => ({
        ...prev,
        history: prev.history.map(item =>
          item.id === id ? { ...item, notes: note } : item
        ),
      }));
    }, []),

    applyAiFix: useCallback((fixedExpression: string) => {
      setState(prev => ({
        ...prev,
        currentInput: fixedExpression,
        error: '',
        aiSuggestion: '',
        showAISuggestion: false,
      }));
    }, []),

    updateInput: useCallback((value: string) => {
      setState(prev => ({
        ...prev,
        currentInput: value,
        error: '',
        aiSuggestion: '',
        showAISuggestion: false,
      }));
    }, []),
  };

  // --- إعدادات ---
  const settings = {
    vibrationEnabled: false,
    setVibrationEnabled: () => {},
    soundEnabled: false,
    setSoundEnabled: () => {},
    taxSettings,
    setTaxSettings: useCallback((newSettings: TaxSettings) => {
      setTaxSettings(newSettings);
    }, []),
    buttonLayout,
    setButtonLayout: useCallback((layout: string) => {
      setButtonLayout(layout);
    }, []),
    maxHistory,
    setMaxHistory: useCallback((value: number) => {
      setMaxHistory(value);
    }, []),
  };

  // --- إضافة وظيفة لتبديل نوع الضريبة (إضافة <-> خصم) ---
  const toggleTaxType = useCallback(() => {
    setState(prev => ({
      ...prev,
      taxType: prev.taxType === 'addition' ? 'discount' : 'addition',
    }));
  }, []);

  // --- إضافة وظيفة لتحديد وضع الضريبة كـ "استخلاص" ---
  const setTaxMode = useCallback((mode: TaxMode) => {
    setState(prev => ({
      ...prev,
      taxMode: mode,
    }));
  }, []);

  // --- إضافة وظيفة لتحديد نسبة الضريبة المخصصة ---
  const setCustomTax = useCallback((rate: number) => {
    setState(prev => ({
      ...prev,
      customTax: rate,
    }));
  }, []);

  // --- إضافة وظيفة لعرض عدد العمليات اليومية ---
  const entryCount = state.history.filter(item => {
    const itemDate = new Date(item.date);
    const today = new Date();
    return itemDate.toDateString() === today.toDateString();
  }).length;

  return {
    settings,
    actions,
    isCalculationExecuted: !!state.result,
    history: state.history,
    input: state.currentInput,
    result: state.result,
    tax: state.tax,
    taxDisplay: state.taxDisplay,
    error: state.error,
    aiSuggestion: state.aiSuggestion,
    showAISuggestion: state.showAISuggestion,
    lastExpression: state.expression,
    entryCount,
    taxType: state.taxType,
    toggleTaxType,
    setTaxMode,
    setCustomTax,
    taxMode: state.taxMode,
    customTax: state.customTax,
  };
};