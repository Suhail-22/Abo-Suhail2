import React, { useState, useMemo } from 'react';
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
  onShareFullHistory: () => void;
  onShareDailyHistory: (date: string) => void; // دالة مشاركة عمليات اليوم
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
  onShareFullHistory,
  onShareDailyHistory // استقبال دالة مشاركة اليوم
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
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center p-4">
      <div className={`
        bg-[var(--bg-panel)] rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-full md:h-[90%] 
        transform transition-all duration-300 ease-out 
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        flex flex-col 
      `}>
        {/* Header Section - Top Sticky */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-secondary)] sticky top-0 bg-[var(--bg-panel)] z-30">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">سجل العمليات</h2>
          <button onClick={onClose} aria-label="إغلاق السجل" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        {/* Action Section - Sticky below header */}
        <div className="p-4 flex flex-wrap gap-2 justify-between items-center border-b border-[var(--border-secondary)] bg-[var(--bg-panel)] sticky top-[56px] z-20"> 
            {/* 1. زر مشاركة السجل الكامل */}
            <button 
                onClick={onShareFullHistory} 
                aria-label="مشاركة السجل كاملاً" 
                className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-green-600/10 text-green-500 hover:bg-green-600/20 transition-colors"
            >
                <Icon name="share" className="w-5 h-5" />
                مشاركة الكل
            </button>
            
            {/* 2. زر مسح السجل */}
            <button 
                onClick={onClearHistory} 
                aria-label="مسح السجل كاملاً" 
                className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-colors"
            >
                <Icon name="trash" className="w-5 h-5" />
                مسح
            </button>
        </div>

        {/* Search and Filter Section - Sticky */}
        <div className="p-4 flex flex-col gap-3 border-b border-[var(--border-secondary)] bg-[var(--bg-panel)] sticky top-[120px] z-20"> 
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في العمليات والملاحظات..."
                className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            
            <div className='flex gap-2 justify-between'>
                <div className='flex flex-col flex-1'>
                    <label htmlFor="startDate" className='text-xs text-[var(--text-secondary)] mb-1'>من تاريخ:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                </div>
                
                <div className='flex flex-col flex-1'>
                    <label htmlFor="endDate" className='text-xs text-[var(--text-secondary)] mb-1'>إلى تاريخ:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                </div>
            </div>
        </div>
        
        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10"> 
            {history.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] mt-8">
                    لا توجد عمليات مسجلة حتى الآن.
                </p>
            ) : sortedDates.length === 0 ? (
                 <p className="text-center text-[var(--text-secondary)] mt-8">
                    لا توجد نتائج مطابقة لفلتر البحث أو التاريخ.
                </p>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map((date) => (
                        <div key={date} className="history-day-group">
                            {/* عنوان اليوم مع عدد العمليات وزر مشاركة اليوم */}
                            <div className="sticky top-[260px] -mt-4 pt-4 mb-2 flex justify-between items-center bg-[var(--bg-panel)] z-15 border-b border-[var(--border-secondary)] pb-2">
                                <h3 className="text-lg font-semibold text-[var(--accent-color)]">
                                    {date} ({groupedAndFilteredHistory[date].length} عملية)
                                </h3>
                                {/* زر مشاركة عمليات اليوم بجانب عدد العمليات */}
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
                                    <div key={item.id} className="p-3 rounded-xl bg-[var(--bg-inset)] shadow-sm border border-[var(--border-secondary)] relative">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[var(--text-secondary)]">{item.time}</span>
                                            <div className="flex gap-1">
                                                {/* زر حذف العملية */}
                                                <button 
                                                    onClick={() => onDeleteItem(item)} 
                                                    aria-label={`حذف ${item.expression}`} 
                                                    className="text-red-500/70 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Icon name="trash" className="h-4 w-4" />
                                                </button>
                                            </div>
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

                                        {/* قسم الملاحظات */}
                                        {item.notes && (
                                            <div className="mt-2 p-2 bg-[var(--bg-inset-hover)] rounded-lg border border-[var(--border-secondary)]">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm text-[var(--text-secondary)] italic break-all flex-1">ملاحظة: {item.notes}</span>
                                                    <button 
                                                        onClick={() => setEditingItem({ id: item.id, note: item.notes || '' })}
                                                        className="text-[var(--accent-color)] hover:text-[var(--text-primary)] text-xs p-1"
                                                    >
                                                        <Icon name="edit" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* حقل تعديل الملاحظة */}
                                        {editingItem?.id === item.id && (
                                            <div className="mt-2 p-2 bg-[var(--bg-inset-hover)] rounded-lg border border-[var(--border-secondary)]">
                                                <input
                                                    type="text"
                                                    value={editingItem.note}
                                                    onChange={(e) => setEditingItem({...editingItem, note: e.target.value})}
                                                    className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-sm"
                                                    placeholder="تعديل الملاحظة..."
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button 
                                                        onClick={handleEditSave}
                                                        className="px-3 py-1 bg-[var(--accent-color)] text-white rounded-lg text-sm hover:bg-[var(--accent-color-hover)] transition-colors"
                                                    >
                                                        حفظ
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingItem(null)}
                                                        className="px-3 py-1 bg-[var(--bg-inset)] text-[var(--text-primary)] rounded-lg text-sm hover:bg-[var(--bg-inset-hover)] transition-colors"
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </div>
                                        )}

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