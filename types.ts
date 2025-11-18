// types.ts

export type TaxMode = 'add-15' | 'extract-custom' | 'divide-93' | 'custom' | 'off';
export type TaxType = 'addition' | 'discount';

export interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  date: string;
  time: string;
  taxMode: TaxMode;
  taxRate: number;
  taxResult: string;
  taxLabel: string;
  notes: string;
}

export interface TaxSettings {
  isEnabled: boolean;
  mode: TaxMode;
  rate: number;
  showTaxPerNumber: boolean;
}

export interface CalculatorState {
  currentInput: string;
  expression: string;
  result: string;
  tax: string;
  taxDisplay: string;
  taxMode: 'off' | 'add-15' | 'extract-custom' | 'divide-93' | 'custom';
  taxRate: number;
  customTax: number;
  taxType: 'addition' | 'discount'; // ← إضافة هذا الحقل
  history: HistoryItem[];
  theme: string;
  showSettings: boolean;
  showHistory: boolean;
  showAbout: boolean;
  showSupport: boolean;
  showConfirmation: boolean;
  confirmationMessage: string;
  onConfirm: () => void;
  editableIndex: number;
  inlineEditorValue: string;
  isEditing: boolean;
  aiSuggestion: string;
  showAISuggestion: boolean;
  lastCalculatedResult: number | null;
}