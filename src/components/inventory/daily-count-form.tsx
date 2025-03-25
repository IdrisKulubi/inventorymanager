'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateInventoryCountWithLog } from '@/lib/actions/logs';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the reason options
const REASON_OPTIONS = [
  { value: 'sale', label: 'Sale' },
  { value: 'waste', label: 'Waste/Expired' },
  { value: 'count_adjustment', label: 'Count Adjustment' },
  { value: 'stock_added', label: 'Stock Added' },
  { value: 'other', label: 'Other' }
] as const;

// Define the form schema
const countFormSchema = z.object({
  quantity: z.coerce.number().min(0, { message: 'Quantity must be 0 or greater' }),
  reason: z.string().min(1, { message: 'Reason is required' }),
  customReason: z.string().optional(),
  notes: z.string().optional(),
});

type CountFormValues = z.infer<typeof countFormSchema>;

interface DailyCountFormProps {
  itemId: number;
  itemName: string;
  currentQuantity: number;
  unit: string;
}

export function DailyCountForm({ itemId, itemName, currentQuantity, unit }: DailyCountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomReason, setShowCustomReason] = useState(false);
  const router = useRouter();
  
  // Initialize form with current values
  const form = useForm<CountFormValues>({
    resolver: zodResolver(countFormSchema),
    defaultValues: {
      quantity: currentQuantity,
      reason: 'count_adjustment',
      customReason: '',
      notes: '',
    },
  });

  async function onSubmit(data: CountFormValues) {
    try {
      setIsSubmitting(true);
      
      if (data.quantity === currentQuantity) {
        toast.info('No change in quantity');
        setIsSubmitting(false);
        return;
      }
      
      // Use custom reason if "other" is selected
      const effectiveReason = data.reason === 'other' && data.customReason 
        ? data.customReason 
        : data.reason;
      
      // Update the inventory count with a log
      const result = await updateInventoryCountWithLog(
        itemId,
        data.quantity,
        effectiveReason,
        data.notes,
        'Current User' // TODO: Replace with actual user name when auth is implemented
      );
      
      if (result.success) {
        toast.success('Inventory count updated successfully');
        router.refresh();
      } else {
        toast.error(`Error updating count: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating inventory count:', error);
      toast.error('Failed to update inventory count');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Update Count: {itemName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Quantity ({unit})</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        {...field}
                        type="number"
                        className="w-24"
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">
                        Current: {currentQuantity} {unit}
                      </span>
                      {field.value !== currentQuantity && (
                        <span className="text-sm font-medium">
                          {field.value > currentQuantity ? (
                            <span className="text-green-500">+{field.value - currentQuantity}</span>
                          ) : (
                            <span className="text-red-500">{field.value - currentQuantity}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowCustomReason(value === 'other');
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASON_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCustomReason && (
              <FormField
                control={form.control}
                name="customReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Reason</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Specify custom reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional details"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end px-0 pb-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.getValues('quantity') === currentQuantity ? 'Confirm Count' : 'Update Count'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 