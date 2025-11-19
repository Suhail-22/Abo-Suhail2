import React, { useState, useMemo, useCallback } from 'react';
import { HistoryItem } from '../types';
import Icon from './Icon';

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
  // [NEW] دوال مشاركة السجل
  onShareFullHistory: () => void;
  onShareDailyHistory: (date: string) => void;
}

type GroupedHistory = {
  [date: string]: HistoryItem[];
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onClearHistory, 
  onHistoryItemClick, 
  onExportHistory, 
  onExportCsvHistory, 
  onUpdateHistoryItemNote, 
  onDeleteItem,
  // [NEW] تمرير دوال المشاركة
  onShareFullHistory,
  onShareDailyHistory
}) => {
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
    if (history.length === 0) return {};

    let filteredHistory = history;

    if (searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredHistory = filteredHistory.filter(item =>
        item.expression.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.result.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.notes?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); 
        filteredHistory = filteredHistory.filter(item => {
            const itemDate = new Date(item.date.replace(/\//g, '-')); 
            return itemDate >= start && itemDate < end;
        });
    }

    const grouped: GroupedHistory = filteredHistory.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as GroupedHistory);

    return grouped;
  }, [history, startDate, endDate, searchTerm]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedAndFilteredHistory).sort((a, b) => {
        const dateA = new Date(a.replace(/\//g, '-')).getTime();
        const dateB = new Date(b.replace(/\//g, '-')).getTime();
        return dateB - dateA;
    });
  }, [groupedAndFilteredHistory]);

  const getTaxModeLabel = (mode?: string, rate?: number) => {
    if (!mode) return "غير مفعلة";
    switch (mode) {
        case 'add-15': return "إضافة 15%";
        case 'divide-93': return "القسمة على 0.93";
        case 'custom': return `إضافة مخصص ${rate}%`;
        case 'extract-custom': return `استخلاص مخصص ${rate}%`;
        default: return "غير معروف";
    }
  };

  if (!isOpen) return null;

  return (
    // z-50 لضمان الظهور فوق أي شيء آخر
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center p-4">
      {/* Panel Container */}
      <div className={`
        bg-[var(--bg-panel)] rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-full md:h-[90%] 
        transform transition-all duration-300 ease-out 
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        flex flex-col 
      `}>
        {/* Header Section */}
        {/* top-0 / z-30 */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-secondary)] sticky top-0 bg-[var(--bg-panel)] z-30">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {/* [MODIFIED] عرض عدد العمليات في التاريخ الحالي فقط */}
            السجل ({Object.keys(groupedAndFilteredHistory).length > 0 ? Object.values(groupedAndFilteredHistory)[0].length : 0})
          </h3>
          <div className="flex items-center gap-2">
            {/* [NEW] زر مشاركة السجل الكامل */}
            <button 
              onClick={onShareFullHistory} 
              aria-label="مشاركة السجل الكامل" 
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inset)] transition-colors"
            >
              <Icon name="share" className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inset)] transition-colors"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search/Filter Section */}
        {/* z-20 */}
        <div className="p-4 border-b border-[var(--border-secondary)] bg-[var(--bg-panel)] z-20">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="البحث في السجل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClearHistory}
                className="flex-1 py-2.5 text-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                مسح الكل
              </button>
              <button
                onClick={() => handleExport(onExportHistory, startDate, endDate)}
                className="py-2.5 px-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors text-sm font-medium"
              >
                TXT
              </button>
              <button
                onClick={() => handleExport(onExportCsvHistory, startDate, endDate)}
                className="py-2.5 px-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium"
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Icon name="history" className="w-16 h-16 text-[var(--text-secondary)]/50 mb-4" />
              <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">السجل فارغ</h4>
              <p className="text-[var(--text-secondary)]">
                {history.length === 0 ? 'لا توجد عمليات حسابية حتى الآن.' : 'لا توجد نتائج مطابقة للبحث.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="history-day-group">
                  {/* تاريخ اليوم - يثبت عندما يتم التمرير */}
                  {/* تم تعديل top ليثبت أسفل قسم Search/Filter - يجب إعادة حساب القيمة الدقيقة بناءً على ارتفاع قسم البحث/الفلترة */}
                  <div className="sticky top-[260px] -mt-4 pt-4 mb-2 flex justify-between items-center bg-[var(--bg-panel)] z-15 border-b border-[var(--border-secondary)] pb-2">
                    <h3 className="text-lg font-semibold text-[var(--accent-color)]">
                      {date} ({groupedAndFilteredHistory[date].length} عملية)
                    </h3>
                    {/* [NEW] زر مشاركة عمليات اليوم */}
                    <button 
                      onClick={() => onShareDailyHistory(date)} 
                      aria-label={`مشاركة عمليات يوم ${date}`} 
                      className="flex items-center gap-1 p-1 rounded-lg text-xs font-medium bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 transition-colors"
                    >
                      <Icon name="share" className="w-4 h-4" />
                      مشاركة اليوم
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {groupedAndFilteredHistory[date].map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-[var(--bg-inset)] shadow-sm border border-[var(--border-secondary)]">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--text-secondary)]">{item.time}</span>
                          {/* زر حذف العملية */}
                          <button 
                            onClick={() => onDeleteItem(item)} 
                            aria-label={`حذف ${item.expression}`} 
                            className="text-red-500/70 hover:text-red-500 transition-colors p-1"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1">
                          <p 
                            onClick={() => onHistoryItemClick(item)}
                            className="text-sm text-[var(--text-secondary)] break-all cursor-pointer hover:underline hover:text-[var(--text-primary)] transition-colors"
                          >
                            {item.expression}
                          </p>
                          <p 
                            onClick={() => onHistoryItemClick(item)}
                            className="text-lg font-bold text-[var(--text-primary)] cursor-pointer hover:underline"
                          >
                            = {item.result}
                          </p>
                        </div>

                        {/* Tax and Notes Section */}
                        {(item.taxResult || item.notes) && (
                          <div className="mt-2 border-t border-[var(--border-secondary)] pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            {/* Tax Info */}
                            {item.taxResult && (
                              <div className="text-sm text-[var(--accent-color)]">
                                <span className="font-medium">{item.taxLabel || 'الضريبة'}:</span> {item.taxResult}
                              </div>
                            )}
                            {/* Notes Info */}
                            {item.notes && (
                              <div className="text-sm text-[var(--text-secondary)] italic break-all">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tax Mode Info (Hidden) */}
                        {item.taxMode && (
                          <div className="mt-1 text-xs text-[var(--text-secondary)]/70">
                            [{getTaxModeLabel(item.taxMode, item.taxRate)}]
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;