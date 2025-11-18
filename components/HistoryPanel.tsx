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
  onShareFullHistory,
  onShareDailyHistory,
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
      filteredHistory = filteredHistory.filter(
        (item) =>
          item.expression.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.result.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.notes?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filteredHistory = filteredHistory.filter((item) => {
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
    if (!mode) return 'غير مفعلة';
    switch (mode) {
      case 'add-15':
        return 'إضافة 15%';
      case 'divide-93':
        return 'القسمة على 0.93';
      case 'custom':
        return `إضافة مخصص ${rate}%`;
      case 'extract-custom':
        return `استخلاص مخصص ${rate}%`;
      default:
        return 'غير معروف';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-end md:items-center p-4">
      {/* Panel Container */}
      <div
        className={`
        bg-[var(--bg-panel)] rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-full md:h-[90%] 
        transform transition-all duration-300 ease-out 
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        flex flex-col 
      `}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-secondary)] sticky top-0 bg-[var(--bg-panel)] z-30">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">سجل العمليات</h2>
          <button onClick={onClose} aria-label="إغلاق السجل" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        {/* Action Section */}
        <div className="p-4 flex flex-wrap gap-2 justify-between items-center border-b border-[var(--border-secondary)] bg-[var(--bg-panel)] sticky top-[56px] z-20">
          {/* 1. مجموعة أزرار التصدير (يمين في RTL) */}
          <div className="flex gap-2">
            {/* زر التصدير TXT */}
            <button
              onClick={() => handleExport(onExportHistory)}
              aria-label="تصدير السجل إلى ملف نصي (TXT)"
              className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-[var(--bg-inset)] text-[var(--text-primary)] hover:bg-[var(--bg-inset-hover)] border border-[var(--border-secondary)] transition-colors"
            >
              <Icon name="file-text" className="w-5 h-5" />
              TXT
            </button>
            {/* زر التصدير CSV */}
            <button
              onClick={() => handleExport(onExportCsvHistory)}
              aria-label="تصدير السجل إلى ملف CSV"
              className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-[var(--bg-inset)] text-[var(--text-primary)] hover:bg-[var(--bg-inset-hover)] border border-[var(--border-secondary)] transition-colors"
            >
              <Icon name="file-csv" className="w-5 h-5" />
              CSV
            </button>
          </div>

          {/* 2. مجموعة أزرار الإجراءات (يسار في RTL) */}
          <div className="flex gap-2 items-center">
            {/* زر مشاركة السجل الكامل */}
            <button
              onClick={onShareFullHistory}
              aria-label="مشاركة السجل كاملاً"
              className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-green-600/10 text-green-500 hover:bg-green-600/20 transition-colors"
            >
              <Icon name="share" className="w-5 h-5" />
              مشاركة
            </button>
            {/* زر مسح السجل */}
            <button
              onClick={onClearHistory}
              aria-label="مسح السجل كاملاً"
              className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-colors"
            >
              <Icon name="trash" className="w-5 h-5" />
              مسح
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-4 flex flex-col gap-3 border-b border-[var(--border-secondary)] bg-[var(--bg-panel)] sticky top-[120px] z-20">
          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في العمليات والملاحظات..."
            className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />

          {/* Date Filters */}
          <div className="flex gap-2 justify-between">
            {/* From Date */}
            <div className="flex flex-col flex-1">
              <label htmlFor="startDate" className="text-xs text-[var(--text-secondary)] mb-1">
                من تاريخ:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col flex-1">
              <label htmlFor="endDate" className="text-xs text-[var(--text-secondary)] mb-1">
                إلى تاريخ:
              </label>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10">
          {history.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)] mt-8">لا توجد عمليات مسجلة حتى الآن.</p>
          ) : sortedDates.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)] mt-8">لا توجد نتائج مطابقة لفلتر البحث أو التاريخ.</p>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="history-day-group">
                  {/* عنصر التاريخ: تم تغييره إلى relative بدلاً من sticky */}
                  <div className="relative mb-4 flex justify-between items-center bg-[var(--bg-panel)] z-15 border-b border-[var(--border-secondary)] pb-2">
                    <h3 className="text-lg font-semibold text-[var(--accent-color)]">
                      {date} ({groupedAndFilteredHistory[date].length} عملية)
                    </h3>
                    {/* زر مشاركة عمليات اليوم */}
                    <button
                      onClick={() => onShareDailyHistory(date)}
                      aria-label={`مشاركة عمليات يوم ${date}`}
                      className="flex items-center gap-1 p-1 rounded-lg text-xs font-medium bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 transition-colors"
                    >
                      <Icon name="share" className="w-4 h-4" />
                      مشاركة اليوم
                    </button>
                  </div>
                  <div className="space-y-3">
                    {groupedAndFilteredHistory[date].map((item) => (
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
                              <div className="text-xs text-[var(--text-secondary)] leading-tight">
                                <p className="font-medium">
                                  {item.taxLabel || 'النتيجة مع الضريبة'}: <span className="text-[var(--text-primary)] font-bold">{item.taxResult}</span>
                                </p>
                                <p className="opacity-80">{getTaxModeLabel(item.taxMode, item.taxRate)}</p>
                              </div>
                            )}

                            {/* Notes & Edit Button */}
                            <div className="flex items-center w-full sm:w-auto">
                              {editingItem && editingItem.id === item.id ? (
                                <div className="flex items-center w-full">
                                  <input
                                    type="text"
                                    value={editingItem.note}
                                    onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                    placeholder="أضف ملاحظة..."
                                    className="flex-grow p-1 rounded border border-[var(--accent-color)] bg-[var(--bg-panel)] text-sm text-[var(--text-primary)]"
                                  />
                                  <button onClick={handleEditSave} className="ml-2 text-sm text-green-500 font-bold hover:text-green-600 whitespace-nowrap">
                                    حفظ
                                  </button>
                                  <button onClick={() => setEditingItem(null)} className="ml-2 text-sm text-red-500 hover:text-red-600 whitespace-nowrap">
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center w-full justify-end">
                                  {item.notes ? (
                                    <p className="text-sm text-[var(--text-secondary)] italic px-2 break-all text-center flex-grow">{`"${item.notes}"`}</p>
                                  ) : (
                                    <div className="flex-grow"></div>
                                  )}
                                  <button
                                    onClick={() => setEditingItem({ id: item.id, note: item.notes || '' })}
                                    className="text-sm text-[var(--accent-color)] hover:underline whitespace-nowrap"
                                  >
                                    {item.notes ? 'تعديل ملاحظة' : 'إضافة ملاحظة'}
                                  </button>
                                </div>
                              )}
                            </div>
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