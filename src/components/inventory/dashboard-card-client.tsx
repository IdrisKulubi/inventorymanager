'use client';

import { DashboardCard } from './dashboard-card';
import { useWasteItems } from './waste-items-provider';

interface ClientDashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  icon: string;
  cardType: 'waste' | 'profit';
}

export function ClientDashboardCard({
  title,
  value,
  description,
  variant = "default",
  icon,
  cardType
}: ClientDashboardCardProps) {
  const { showWasteModal, showProfitExport } = useWasteItems();
  
  const handleClick = () => {
    if (cardType === 'waste') {
      showWasteModal();
    } else if (cardType === 'profit') {
      showProfitExport();
    }
  };
  
  return (
    <DashboardCard
      title={title}
      value={value}
      description={description}
      variant={variant}
      icon={icon}
      onClick={handleClick}
    />
  );
} 