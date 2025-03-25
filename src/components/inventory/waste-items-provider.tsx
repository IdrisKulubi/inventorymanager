'use client';

import { createContext, useContext, useState } from 'react';
import { WasteDetailsModal } from './waste-details-modal';
import { ProfitExportDialog } from './profit-export-dialog';
import { Button } from '../ui/button';

// Context for waste items state
type WasteItemsContextType = {
  showWasteModal: () => void;
  showProfitExport: () => void;
};

const WasteItemsContext = createContext<WasteItemsContextType | null>(null);

export function useWasteItems() {
  const context = useContext(WasteItemsContext);
  if (!context) {
    throw new Error('useWasteItems must be used within a WasteItemsProvider');
  }
  return context;
}

// Provider component
export function WasteItemsProvider({ children }: { children: React.ReactNode }) {
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  
  // Context value
  const value = {
    showWasteModal: () => setWasteModalOpen(true),
    showProfitExport: () => {
      // This function is implemented inside the ProfitExportDialog component
      // and will be triggered by the button click
      const exportButton = document.getElementById('profit-export-trigger');
      if (exportButton) {
        exportButton.click();
      }
    }
  };

  return (
    <WasteItemsContext.Provider value={value}>
      {children}
      
      {/* Waste Details Modal */}
      <WasteDetailsModal 
        open={wasteModalOpen} 
        onOpenChange={setWasteModalOpen} 
      />
      
      {/* Hidden trigger for profit export */}
      <div className="hidden">
        <ProfitExportDialog>
          <Button id="profit-export-trigger">Export</Button>
        </ProfitExportDialog>
      </div>
    </WasteItemsContext.Provider>
  );
} 