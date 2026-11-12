import React, { createContext, useContext, useState, useEffect } from 'react';
import { Api } from '../api/endpoints';
import { Payslip } from '../types';

interface AppContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  refreshNotificationsCount: () => Promise<void>;
  selectedPayslip: Payslip | null;
  setSelectedPayslip: (slip: Payslip | null) => void;
  isAdvanceModalOpen: boolean;
  setIsAdvanceModalOpen: (open: boolean) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(2);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const refreshNotificationsCount = async () => {
    try {
      const notifs = await Api.getNotifications();
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshNotificationsCount();
  }, [refreshKey]);

  return (
    <AppContext.Provider
      value={{
        refreshKey,
        triggerRefresh,
        unreadCount,
        setUnreadCount,
        refreshNotificationsCount,
        selectedPayslip,
        setSelectedPayslip,
        isAdvanceModalOpen,
        setIsAdvanceModalOpen,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
