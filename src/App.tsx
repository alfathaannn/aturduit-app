import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActiveTab, Pocket } from './types';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { PocketsView } from './components/pockets/PocketsView';
import { HistoryView } from './components/history/HistoryView';
import { NotepadView } from './components/notepad/NotepadView';
import { SettingsView } from './components/settings/SettingsView';

// Modals & Sheets
import { TransactionSheet } from './components/modals/TransactionSheet';
import { PocketModal } from './components/modals/PocketModal';
import { AllocateModal } from './components/modals/AllocateModal';
import { ExportPdfModal } from './components/modals/ExportPdfModal';
import { PocketDetailModal } from './components/modals/PocketDetailModal';

export const App: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: 'income' | 'expense';
    pocketId?: string;
  }>({
    isOpen: false,
    type: 'income',
  });

  const [pocketModal, setPocketModal] = useState<{
    isOpen: boolean;
    pocket?: Pocket | null;
  }>({
    isOpen: false,
    pocket: null,
  });

  const [allocateModal, setAllocateModal] = useState<{
    isOpen: boolean;
    pocketId?: string;
  }>({
    isOpen: false,
  });

  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [detailPocket, setDetailPocket] = useState<Pocket | null>(null);

  const handleOpenTransaction = (type: 'income' | 'expense', pocketId?: string) => {
    setTransactionModal({ isOpen: true, type, pocketId });
  };

  const handleOpenAddPocket = () => {
    setPocketModal({ isOpen: true, pocket: null });
  };

  const handleEditPocket = (pocket: Pocket) => {
    setPocketModal({ isOpen: true, pocket });
  };

  const handleOpenAllocate = (pocketId?: string) => {
    setAllocateModal({ isOpen: true, pocketId });
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-[#191d24] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-sky-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-400/10 dark:bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area with Page Transition Animation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 main-safe-top pb-28 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.995 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 28,
            }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenTransaction={handleOpenTransaction}
                onOpenAllocate={() => handleOpenAllocate()}
                onOpenAddPocket={handleOpenAddPocket}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'pockets' && (
              <PocketsView
                onOpenAddPocket={handleOpenAddPocket}
                onEditPocket={handleEditPocket}
                onAllocatePocket={handleOpenAllocate}
                onSelectPocketDetail={setDetailPocket}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView onOpenExportPdf={() => setIsExportPdfOpen(true)} />
            )}

            {activeTab === 'notepad' && <NotepadView />}

            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation with Animated Sliding Indicator */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals & Sheets */}
      <TransactionSheet
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal((prev) => ({ ...prev, isOpen: false }))}
        defaultType={transactionModal.type}
        defaultPocketId={transactionModal.pocketId}
      />

      <PocketModal
        isOpen={pocketModal.isOpen}
        onClose={() => setPocketModal({ isOpen: false, pocket: null })}
        pocketToEdit={pocketModal.pocket}
      />

      <AllocateModal
        isOpen={allocateModal.isOpen}
        onClose={() => setAllocateModal({ isOpen: false })}
        targetPocketId={allocateModal.pocketId}
      />

      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
      />

      <PocketDetailModal
        isOpen={Boolean(detailPocket)}
        onClose={() => setDetailPocket(null)}
        pocket={detailPocket}
        onEdit={handleEditPocket}
        onAllocate={handleOpenAllocate}
      />
    </div>
  );
};
