import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import Icon from './Icon'; // تأكد من وجود ملف Icon.tsx

// [MODIFIED] إضافة خصائص المشاركة الجديدة
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
  // [NEW] خصائص المشاركة
  onShareFullHistory: () => void;
  onShareDailyHistory: (date: string) => void;
}

// [NEW] تعريف نوع جديد للمتغير المجمَّع
type GroupedHistory = {
  [date: string]: HistoryItem[];
};


const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onClearHistory, onHistoryItemClick, onExportHistory, onExportCsvHistory, onUpdateHistoryItemNote, onDeleteItem, onShareFullHistory, onShareDailyHistory }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: number; note: string } | null>(null);

  const handleExport = (exportFunc: (start: string, end: string) => void) => {
    exportFunc(startDate, endDate);
  };
  
  const filteredAndGroupedHistory: GroupedHistory = useMemo(() => {
    let filtered = history;

    // 1. تصفية حسب البحث
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.expression.toLowerCase().includes(lowerSearchTerm) || 
        item.result.toLowerCase().includes(lowerSearchTerm) ||
        (item.notes && item.notes.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // 2. تصفية حسب التاريخ
    if (startDate) {
      filtered = filtered.filter(item => item.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.date <= endDate);
    }

    // 3. تجميع حسب التاريخ (Group By Date)
    return filtered.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as GroupedHistory);

  }, [history, searchTerm, startDate, endDate]);
  
  // يتم ترتيب المفاتيح (التواريخ) تنازليًا
  const sortedDates = useMemo(() => Object.keys(filteredAndGroupedHistory).sort((a, b) => b.localeCompare(a)), [filteredAndGroupedHistory]);

  const totalFilteredEntries = useMemo(() => Object.values(filteredAndGroupedHistory).flat().length, [filteredAndGroupedHistory]);
  
  const handleSaveNote = (id: number, currentNote: string) => {
    if (editingItem && editingItem.id === id) {
        onUpdateHistoryItemNote(id, currentNote);
        setEditingItem(null);
    }
  };

  return (
    // ⚠️ تم تغيير z-index إلى z-[60] لضمان الظهور فوق الـ Overlay (z-50)
    <div className={`absolute top-0 bottom-0 right-0 w-[320px] max-w-[85vw] bg-[var(--bg-panel)] text-[var(--text-primary)] z-[60] p-5 shadow-2xl overflow-y-auto border-l-2 border-[var(--border-primary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[var(--accent-color)] text-2xl font-bold">📖 سجل العمليات ({totalFilteredEntries})</h3>
        <button onClick={onClose} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <input 
            type="text" 
            placeholder="البحث في السجل..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-base"
        />
        
        {/* أزرار المشاركة والتصدير والمسح في صف واحد */}
        <div className="flex flex-wrap gap-2">
            {/* [NEW] زر مشاركة السجل كاملاً */}
            <button onClick={onShareFullHistory} disabled={totalFilteredEntries === 0} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 transition-colors text-white disabled:opacity-50 min-w-[45%]">
                <Icon name="share" className="w-4 h-4 ml-1 inline-block" /> مشاركة السجل
            </button>
            
            {/* زر التصدير TXT */}
            <button onClick={() => handleExport(onExportHistory)} disabled={totalFilteredEntries === 0} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[var(--bg-inset)] hover:brightness-95 transition-colors border border-[var(--border-secondary)] disabled:opacity-50 min-w-[45%]">
                <Icon name="file_download" className="w-4 h-4 ml-1 inline-block" /> TXT
            </button>
            
            {/* زر التصدير CSV */}
            <button onClick={() => handleExport(onExportCsvHistory)} disabled={totalFilteredEntries === 0} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[var(--bg-inset)] hover:brightness-95 transition-colors border border-[var(--border-secondary)] disabled:opacity-50 min-w-[45%]">
                <Icon name="file_download" className="w-4 h-4 ml-1 inline-block" /> CSV
            </button>
            
            {/* زر مسح السجل */}
            <button onClick={onClearHistory} disabled={totalFilteredEntries === 0} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors text-white disabled:opacity-50 min-w-[45%]">
                <Icon name="delete" className="w-4 h-4 ml-1 inline-block" /> مسح
            </button>
        </div>

        {/* فلاتر التاريخ (احتفظ بها في حال أردت استخدامها لاحقاً) */}
        <div className="flex gap-2 text-sm text-[var(--text-secondary)] mt-2">
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-1/2 p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-center appearance-none"
                dir="ltr"
            />
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-1/2 p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-center appearance-none"
                dir="ltr"
            />
        </div>

      </div>

      <div className="h-full max-h-[calc(100vh-250px)] overflow-y-auto">
        {totalFilteredEntries === 0 && (
            <p className="text-center text-[var(--text-secondary)] p-8">لا يوجد عمليات لعرضها.</p>
        )}
        
        {totalFilteredEntries > 0 && (
            <div className="space-y-4">
                {/* التكرار على التواريخ المرتبة تنازلياً */}
                {sortedDates.map((date) => (
                    <div key={date} className="bg-[var(--bg-inset)] rounded-xl shadow-lg p-3">
                        <div className="flex justify-between items-center border-b pb-2 mb-3 border-[var(--border-secondary)]">
                            {/* [MODIFIED] عرض التاريخ وحجم المجموعة */}
                            <h5 className="font-bold text-lg text-[var(--text-primary)]">
                                {date} ({filteredAndGroupedHistory[date].length})
                            </h5>
                            {/* [NEW] زر مشاركة عمليات هذا اليوم */}
                            <button onClick={() => onShareDailyHistory(date)} className="text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold flex items-center">
                                <Icon name="share" className="w-4 h-4 ml-1" /> مشاركة عمليات اليوم
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* عرض عمليات هذا اليوم */}
                            {filteredAndGroupedHistory[date].map(item => (
                                <div key={item.id} className="p-3 bg-[var(--bg-card)] rounded-lg shadow-inner border border-[var(--border-secondary)]">
                                    <div 
                                        onClick={() => onHistoryItemClick(item)} 
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <p className="text-sm text-[var(--text-secondary)]">{item.time}</p>
                                        <p className="text-xl font-medium text-[var(--text-primary)] break-words dir-ltr">{item.expression}</p>
                                        <p className="text-2xl font-bold text-[var(--accent-color)] break-words dir-ltr mt-1">= {item.result}</p>
                                        {item.taxResult && (
                                            <p className="text-sm text-green-500 mt-1 break-words dir-ltr">
                                                {item.taxLabel || 'النتيجة مع الضريبة'}: {item.taxResult}
                                            </p>
                                        )}
                                    </div>

                                    {/* منطقة الملاحظة والحذف */}
                                    <div className="mt-3 pt-2 border-t border-[var(--border-secondary)] flex flex-col gap-2">
                                        <button 
                                            onClick={() => onDeleteItem(item)} 
                                            className="text-red-500 text-sm font-semibold flex items-center justify-end hover:text-red-600 transition-colors w-full"
                                        >
                                            <Icon name="delete" className="w-4 h-4 mr-1" /> حذف العملية
                                        </button>
                                        
                                        {/* محرر الملاحظة */}
                                        {editingItem && editingItem.id === item.id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    value={editingItem.note}
                                                    onChange={(e) => setEditingItem(prev => (prev ? {...prev, note: e.target.value} : null))}
                                                    placeholder="أضف ملاحظة لهذه العملية..."
                                                    className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] text-sm resize-none h-16"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setEditingItem(null)} 
                                                        className="text-[var(--text-secondary)] text-sm hover:underline"
                                                    >
                                                        إلغاء
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSaveNote(item.id, editingItem.note)} 
                                                        className="text-green-500 text-sm font-bold hover:underline"
                                                    >
                                                        حفظ الملاحظة
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                {item.notes ? (
                                                    <p className="text-sm text-[var(--text-secondary)] italic px-2 break-all flex-grow">
                                                        {`\"${item.notes}\"`}
                                                    </p>
                                                ) : (
                                                    <div className="flex-grow"></div>
                                                )}
                                                <button 
                                                    onClick={() => setEditingItem({ id: item.id, note: item.notes || '' })} 
                                                    className="text-sm text-[var(--accent-color)] hover:underline whitespace-nowrap"
                                                >
                                                    {item.notes ? "تعديل ملاحظة" : "إضافة ملاحظة"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
