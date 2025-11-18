import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useCalculator } from './hooks/useCalculator';
import { useLocalStorage } from './hooks/useLocalStorage';
import Calculator from './components/Calculator';
import Overlay from './components/Overlay';
import Notification from './components/Notification';
import ConfirmationDialog from './components/ConfirmationDialog';
import { HistoryItem } from './types';

const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const SupportPanel = lazy(() => import('./components/SupportPanel'));
const AboutPanel = lazy(() => import('./components/AboutPanel'));

type ConfirmationState = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
};

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', show: false });
  const [appUpdate, setAppUpdate] = useState<{ available: boolean; registration: ServiceWorkerRegistration | null }>({ available: false, registration: null });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, onConfirm: () => {}, onCancel: () => {}, title: '', message: '' });

  const [theme, setTheme] = useLocalStorage<string>('calcTheme_v3', 'system');
  const [fontFamily, setFontFamily] = useLocalStorage<string>('calcFontFamily_v2', 'Tajawal');
  const [fontScale, setFontScale] = useLocalStorage<number>('calcFontScale_v2', 1);
  const [buttonTextColor, setButtonTextColor] = useLocalStorage<string | null>('calcButtonTextColor_v1', null);
  
  // ======================================================
  // [NEW] 🔒 ميزة قفل الدوران (الإعداد سيكون في SettingsPanel لاحقاً)
  const [isOrientationLocked, setIsOrientationLocked] = useLocalStorage<boolean>('isOrientationLocked_v1', false);
  
  useEffect(() => {
    if ('orientation' in screen && 'lock' in screen.orientation) {
        if (isOrientationLocked) {
            // القفل على الوضع العمودي
            screen.orientation.lock('portrait').catch(err => console.error("Failed to lock orientation:", err));
        } else {
            // إلغاء القفل ليعود إلى تلقائي (أفقي/عمودي)
            screen.orientation.unlock();
        }
    }
  }, [isOrientationLocked]);
  // ======================================================

  const showNotification = useCallback((message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => {
      setNotification({ message: '', show: false });
    }, 2500);
  }, []);
  
  const calculator = useCalculator({ showNotification });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('history') === 'true') {
        setIsHistoryOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.has('text')) {
        const sharedText = params.get('text');
        if (sharedText) {
            calculator.actions.updateInput(sharedText);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [calculator.actions]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            document.documentElement.classList.toggle('dark', mediaQuery.matches);
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mediaQuery.matches ? '#0a0e17' : '#FFFFFF');
        }
    };

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0e17');
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FFFFFF');
    } else {
        handleChange();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
      document.documentElement.style.setProperty('--font-family', fontFamily);
      document.documentElement.style.setProperty('--font-scale', String(fontScale));
  }, [fontFamily, fontScale]);

  useEffect(() => {
    if (buttonTextColor) {
        document.documentElement.style.setProperty('--button-text-color-custom', buttonTextColor);
    } else {
        document.documentElement.style.removeProperty('--button-text-color-custom');
    }
  }, [buttonTextColor]);

   useEffect(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            setAppUpdate(prev => ({...prev, registration}));
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setAppUpdate({ available: true, registration });
                        }
                    };
                }
            };
        });
        let refreshing: boolean;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    }
  }, []);
  
  const closeAllPanels = useCallback(() => {
    setIsSettingsOpen(false);
    setIsHistoryOpen(false);
    setIsSupportOpen(false);
    setIsAboutOpen(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    if (calculator.history.length === 0) {
        showNotification("السجل فارغ بالفعل.");
        return;
    }
    setConfirmation({
        isOpen: true,
        title: 'مسح سجل العمليات',
        message: 'هل أنت متأكد أنك تريد مسح السجل بالكامل؟ لا يمكن التراجع عن هذا الإجراء.',
        onConfirm: () => {
            calculator.actions.clearHistory();
            setConfirmation(prev => ({ ...prev, isOpen: false }));
            showNotification("تم مسح السجل بنجاح.");
        },
        onCancel: () => {
            setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
    });
  }, [calculator.history, calculator.actions.clearHistory, showNotification]);
  
  const handleDeleteHistoryItem = useCallback((item: HistoryItem) => {
    setConfirmation({
        isOpen: true,
        title: 'حذف العملية',
        message: `هل أنت متأكد من حذف العملية: "${item.expression} = ${item.result}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        onConfirm: () => {
            calculator.actions.deleteHistoryItem(item.id);
            setConfirmation(prev => ({ ...prev, isOpen: false }));
            showNotification("تم حذف العملية بنجاح.");
        },
        onCancel: () => {
            setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
    });
  }, [calculator.actions.deleteHistoryItem, showNotification]);

  const onCheckForUpdates = useCallback(() => {
    appUpdate.registration?.update().then(() => {
      // After update(), the state of installing/waiting might not be immediately available.
      // The 'updatefound' event listener is the more reliable way to detect updates.
      // For immediate feedback, we can check, but it might not catch the very latest state.
      if (appUpdate.registration?.installing) {
        showNotification("جاري البحث عن تحديثات...");
      } else if (appUpdate.registration?.waiting) {
        setAppUpdate(prev => ({ ...prev, available: true }));
        showNotification("تم العثور على تحديث جديد!");
      } else {
        showNotification("أنت تستخدم أحدث إصدار.");
      }
    }).catch(() => {
      showNotification("فشل التحقق من التحديثات. تحقق من اتصالك بالإنترنت.");
    });
  }, [appUpdate.registration, showNotification]);


  const onUpdateAccepted = () => {
      if (appUpdate.registration && appUpdate.registration.waiting) {
          appUpdate.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
  };
  
  // ======================================================
  // [MODIFIED] تعديل وظيفة التصدير لإضافة BOM لـ TXT (لإصلاح مشكلة التشفير)
  const createExportContent = useCallback((history: any[], format: 'txt' | 'csv') => {
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
    
    // علامة الترتيب البايتية (BOM) لضمان UTF-8 في برامج ويندوز
    const BOM = '\uFEFF'; 

    if (format === 'txt') {
        const header = "سجل عمليات الآلة الحاسبة المتقدمة\n\n";
        const content = history.map(item =>
            `التاريخ: ${item.date} - ${item.time}\n` +
            `العملية: ${item.expression}\n` +
            `النتيجة: ${item.result}\n` +
            (item.taxResult ? `وضع الضريبة: ${getTaxModeLabel(item.taxMode, item.taxRate)}\n${item.taxLabel || 'النتيجة مع الضريبة'}: ${item.taxResult}\n` : '') +
            (item.notes ? `ملاحظة: ${item.notes}\n` : '') +
            "------------------------------------\n"
        ).join('\n');
        // تم إضافة BOM هنا
        return BOM + header + content;
    }

    if (format === 'csv') {
        const escapeCsvCell = (cell: any) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
        const headers = ["التاريخ", "الوقت", "العملية", "النتيجة", "وضع الضريبة", "نسبة الضريبة", "النتيجة الثانوية (ضريبة/أصل)", "الملاحظات"].map(escapeCsvCell).join(',');
        const rows = history.map(item => [
            item.date, item.time, item.expression, item.result,
            getTaxModeLabel(item.taxMode, item.taxRate), item.taxRate, item.taxResult, item.notes
        ].map(escapeCsvCell).join(',')).join('\n');
        // BOM موجودة بالفعل في النسخة الأصلية للـ CSV
        return BOM + headers + '\n' + rows;
    }
    return '';
  }, []);

  const handleExport = useCallback((format: 'txt' | 'csv', startDate: string, endDate: string) => {
      const filteredHistory = calculator.history; // Filtering logic can be added here if needed

      if (filteredHistory.length === 0) {
          showNotification("لا يوجد سجل للتصدير.");
          return;
      }

      const content = createExportContent(filteredHistory, format);
      // التشفير utf-8 تم تحديده في البنية
      const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8'; 
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `calculator-history-${timestamp}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(`جاري تصدير السجل كـ ${format.toUpperCase()}...`);
      closeAllPanels();
  }, [calculator.history, closeAllPanels, showNotification, createExportContent]);
  
  // ======================================================
  // [NEW] إضافة وظيفة المشاركة (Share)
  
  const createShareContent = useCallback((history: HistoryItem[], type: 'full' | 'day', date?: string) => {
    // دالة مساعدة لتنسيق عنصر واحد
    const formatItem = (item: HistoryItem) => 
        `${item.expression} = ${item.result}` + (item.taxResult ? ` (مع ضريبة: ${item.taxResult})` : '');

    if (type === 'full') {
        const header = "--- سجل عمليات الآلة الحاسبة (الكامل) ---\n";
        const content = history.map(item => `\n${item.date} - ${item.time}:\n${formatItem(item)}`).join('');
        return { 
            title: 'مشاركة سجل العمليات الكامل', 
            text: header + content + "\n\n---"
        };
    }

    if (type === 'day' && date) {
        // يتم استخدام التاريخ كما تم تمريره من HistoryPanel
        const dayHistory = history.filter(item => item.date === date);
        const header = `--- سجل عمليات يوم: ${date} ---\n`;
        const content = dayHistory.map(item => `\n${item.time}: ${formatItem(item)}`).join('');
        return { 
            title: `مشاركة سجل عمليات يوم ${date}`, 
            text: header + content + "\n\n---"
        };
    }
    return { title: 'مشاركة', text: 'لا يوجد محتوى للمشاركة.' };
  }, []);

  const handleShare = useCallback(async (type: 'full' | 'day', date?: string) => {
    if (!navigator.share) {
        showNotification("ميزة المشاركة غير مدعومة في متصفحك أو جهازك.");
        return;
    }

    let historyToShare: HistoryItem[] = calculator.history;
    
    // التاريخ يكون بصيغة 'YYYY/MM/DD' في السجل، لذا نستخدمه كما هو للمقارنة
    const dateToFilter = date; 

    if (type === 'day' && dateToFilter) {
        historyToShare = calculator.history.filter(item => item.date === dateToFilter);
        if (historyToShare.length === 0) {
            showNotification(`لا يوجد عمليات ليوم ${dateToFilter}.`);
            return;
        }
    } else if (type === 'full' && calculator.history.length === 0) {
        showNotification("السجل فارغ ولا يمكن مشاركته.");
        return;
    }

    const { title, text } = createShareContent(historyToShare, type, dateToFilter);

    try {
        await navigator.share({
            title: title,
            text: text
        });
        showNotification("تمت مشاركة السجل بنجاح!");
    } catch (error) {
        // يتم تجاهل خطأ الإلغاء
        if ((error as Error).name !== 'AbortError') {
             console.error('Sharing failed:', error);
             showNotification("فشلت عملية المشاركة.");
        }
    }
  }, [calculator.history, showNotification, createShareContent]);
  
  // ======================================================
  
  const anyPanelOpen = isSettingsOpen || isHistoryOpen || isSupportOpen || isAboutOpen;

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-fixed" style={{ background: 'var(--bg-primary-gradient)' }}>
      <div id="app-container" className={`flex justify-center items-center min-h-screen w-full font-sans relative pt-24 pb-8 md:pt-8`}>
        {appUpdate.available && (
           <div className="absolute top-4 z-20 w-[calc(100%-2rem)] max-w-[420px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in-down">
             <div>
               <h4 className="font-bold">✨ تحديث جديد جاهز!</h4>
               <p className="text-sm opacity-90">اضغط للتثبيت وإعادة تشغيل الآلة الحاسبة.</p>
             </div>
             <button onClick={onUpdateAccepted} className="bg-white text-blue-600 font-bold py-1.5 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">تثبيت</button>
           </div>
        )}
        <Calculator
          calculator={calculator}
          onToggleSettings={() => setIsSettingsOpen(v => !v)}
          onToggleHistory={() => setIsHistoryOpen(v => !v)}
          onShare={showNotification}
          entryCount={calculator.entryCount}
        />
      </div>
      <Overlay show={anyPanelOpen} onClick={closeAllPanels} />
      <Suspense fallback={null}>
        {isSettingsOpen && <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={closeAllPanels}
          settings={calculator.settings}
          theme={theme}
          onThemeChange={setTheme}
          fontFamily={fontFamily} 
          setFontFamily={setFontFamily}
          fontScale={fontScale}
          setFontScale={setFontScale}
          buttonTextColor={buttonTextColor}
          setButtonTextColor={setButtonTextColor}
          // [NEW] إضافة خاصية قفل الدوران
          isOrientationLocked={isOrientationLocked} 
          setIsOrientationLocked={setIsOrientationLocked} 
          onOpenSupport={() => { closeAllPanels(); setIsSupportOpen(true); }}
          onShowAbout={() => { closeAllPanels(); setIsAboutOpen(true); }}
          onCheckForUpdates={onCheckForUpdates}
        />}
        {isHistoryOpen && <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={closeAllPanels}
          history={calculator.history}
          onClearHistory={handleClearHistory}
          onHistoryItemClick={(item) => {
            calculator.actions.loadFromHistory(item.expression);
            closeAllPanels();
          }}
          onExportHistory={(start, end) => handleExport('txt', start, end)}
          onExportCsvHistory={(start, end) => handleExport('csv', start, end)}
          // [NEW] إضافة خصائص المشاركة
          onShareFullHistory={() => handleShare('full')}
          onShareDailyHistory={(date) => handleShare('day', date)}
          onUpdateHistoryItemNote={calculator.actions.updateHistoryItemNote}
          onDeleteItem={handleDeleteHistoryItem}
        />}
        {isSupportOpen && <SupportPanel isOpen={isSupportOpen} onClose={closeAllPanels} />}
        {isAboutOpen && <AboutPanel isOpen={isAboutOpen} onClose={closeAllPanels} />}
      </Suspense>
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={() => confirmation.onConfirm()}
        onCancel={() => confirmation.onCancel()}
      />
      <Notification message={notification.message} show={notification.show} />
    </div>
  );
}

export default App;
