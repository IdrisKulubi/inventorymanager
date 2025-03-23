"use client";

import {  Calendar, FileDown, Pencil } from "lucide-react";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";

export function AddItemActionButton() {
  return (
    <AddItemDialog />
  );
}

export const AddItemAction = {
  component: <AddItemActionButton />,
};

export function DailyUpdatesActionButton() {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href="/inventory/daily-updates">
        <Calendar className="mr-2 h-4 w-4" />
        Daily Updates
      </Link>
    </Button>
  );
}

export const DailyUpdatesAction = {
  component: <DailyUpdatesActionButton />,
};

export function ExportActionButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick}>
      <FileDown className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}

export const ExportAction = {
  component: <ExportActionButton />,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditItemActionButton({ item }: { item: any }) {
  return (
    <EditItemDialog 
      item={item} 
      variant="default" 
      trigger={
        <Button size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Item
        </Button>
      }
    />
  );
} 