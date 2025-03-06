"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export function SupplierDetails({ 
  name,
  contact 
}: {
  name: string;
  contact?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-primary font-semibold">
          {name}
        </Button>
      </DialogTrigger>
      <DialogTitle ></DialogTitle>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Supplier Details</h3>
          <div>
            <p className="font-medium">Name: {name}</p>
            {contact && <p className="mt-1">Contact: {contact}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 