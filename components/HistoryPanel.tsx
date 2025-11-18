import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onHistoryItemClick: (item: HistoryItem) => void;
  onExportHistory: (startDate: string, endDate: string) => void;
  onExportCsvHistory: (startDate: string, endDate: string) => void;
  onUpdateHistoryItemNote: (id: number, note: string) => void;
  onDeleteItem: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onClearHistory, onHistoryItemClick, onExportHistory, onExportCsvHistory, onUpdateHistoryItemNote, onDeleteItem }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: number; note: string } | null>(null);

  const handleExport = (exportFunc: (start: string, end: string) => void) => {
    exportFunc(startDate, endDate);
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    onUpdateHistoryItemNote(editingItem.id, editingItem.note);
    setEditingItem(null);
  };

  const groupedAndFilteredHistory = useMemo(() => {
    const dailyTotals: { [date: string]: number } = {};
    history.forEach(item => {
        if (dailyTotals[item.date] === undefined) {
            dailyTotals[item.date] = 0;
        }
        const resultNumber = parseFloat(item.result.replace(/,/g, ''));
        if (!isNaN(resultNumber)) {
            dailyTotals[item.date] += resultNumber;
        }
    });

    const filtered = history.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            item.expression.toLowerCase().includes(searchLower) ||
            item.result.toLowerCase().includes(searchLower) ||
            (item.notes && item.notes.toLowerCase().includes(searchLower))
        );
    });

    if (filtered.length === 0) return [];

    const groups: { [date: string]: { items: HistoryItem[] } } = {};
    filtered.forEach(item => {
        if (!groups[item.date]) {
            groups[item.date] = { items: [] };
        }
        groups[item.date].items.push(item);
    });
    
    return Object.entries(groups).map(([date, data]) => ({
        date,
        items: data.items,
        total: dailyTotals[date] || 0,
    })).sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
    });
  }, [history, searchTerm]);

  return (
    <div className={`absolute top-0 bottom-0 left-0 w-[320px] max-w-[85vw] bg-[var(--bg-panel)] text-[var(--text-primary)] z-50 p-5 shadow-2xl overflow-y-auto border-r-2 border-[var(--border-primary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[var(--accent-color)] text-2xl font-bold">{`السجل (${history.length})`} 📜</h3>
        <button onClick={onClose} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
      </div>
      <div className="mb-4">
         <input type="search" placeholder="ابحث في السجل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2.5 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-base" />
      </div>
      <div className="text-center mb-4 flex justify-center gap-2">
        <button onClick={onClearHistory} className="py-1 px-3 text-sm rounded-lg bg-[var(--bg-inset)] text-[var(--accent-color)] hover:brightness-95 transition-colors">مسح</button>
        <button onClick={() => handleExport(onExportHistory)} className="py-1 px-3 text-sm rounded-lg bg-[var(--bg-inset)] text-sky-400 hover:brightness-95 transition-colors">TXT</button>
        <button onClick={() => handleExport(onExportCsvHistory)} className="py-1 px-3 text-sm rounded-lg bg-[var(--bg-inset)] text-green-400 hover:brightness-95 transition-colors">CSV</button>
      </div>
      <div className="flex flex-col">
        {groupedAndFilteredHistory.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] text-base mt-8">
            {history.length === 0 ? 'السجل فارغ.' : 'لا توجد نتائج مطابقة للبحث.'}
          </p>
        ) : (
          groupedAndFilteredHistory.map(({ date, items, total }, groupIndex) => (
            <div key={date}>
              <div className={`flex justify-between items-center py-2 ${groupIndex > 0 ? 'mt-3 border-t border-[var(--border-secondary)]' : ''}`}>
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-green-400">
                        الإجمالي: {total.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                        ({items.length} عمليات)
                    </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text-secondary)]">{date}</h4>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const isEditing = editingItem && editingItem.id === item.id;
                  return (
                    <div key={item.id} className="p-3 bg-[var(--bg-inset-light)] rounded-xl transition-all duration-200">
                      <div onClick={() => !isEditing && onHistoryItemClick(item)} className="cursor-pointer space-y-1">
                          <div className="text-sm opacity-80 direction-ltr text-left break-all text-[var(--text-secondary)]">= {item.expression}</div>
                          <div className="text-4xl font-bold direction-ltr text-left break-all text-[var(--text-primary)]">{item.result}</div>
                          {item.taxResult && (
                              <div className="text-cyan-400 text-base">{`${item.taxLabel || 'الإجمالي مع الضريبة'}: ${item.taxResult}`}</div>
                          )}
                          <div className="text-[var(--text-secondary)] opacity-70 text-xs pt-1">{item.date} - {item.time}</div>
                      </div>
                      {isEditing ? (
                          <div className="mt-3 animate-fade-in-down">
                              <textarea
                                  value={editingItem.note}
                                  onChange={(e) => setEditingItem(prev => ({...prev!, note: e.target.value}))}
                                  className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-sm"
                                  placeholder="أضف ملاحظة..."
                                  rows={2}
                              />
                              <div className="flex gap-2 mt-2">
                                  <button onClick={handleEditSave} className="flex-1 py-1 text-sm rounded-lg bg-green-500/80 text-white">حفظ</button>
                                  <button onClick={() => setEditingItem(null)} className="flex-1 py-1 text-sm rounded-lg bg-[var(--bg-inset)]">إلغاء</button>
                              </div>
                          </div>
                      ) : (
                        <div className="mt-2 flex justify-between items-center gap-2">
                             <button
                                onClick={() => onDeleteItem(item)}
                                aria-label={`حذف ${item.expression}`}
                                className="text-red-500/70 hover:text-red-500 transition-colors p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            
                            {item.notes ? (
                                <p className="text-sm text-[var(--text-secondary)] italic px-2 break-all text-center flex-grow">{`"${item.notes}"`}</p>
                            ) : (
                                <div className="flex-grow"></div>
                            )}

                            <button onClick={() => setEditingItem({ id: item.id, note: item.notes || '' })} className="text-sm text-[var(--accent-color)] hover:underline whitespace-nowrap">{item.notes ? "تعديل ملاحظة" : "إضافة ملاحظة"}</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
