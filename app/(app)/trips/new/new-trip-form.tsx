'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTripAction } from './actions';

// ISO 4217 currency codes (common subset)
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'BRL', name: 'Brazilian Real' },
];

const newTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(200),
  destination: z.string().min(1, 'Destination is required').max(200),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  defaultCurrency: z.string().length(3).toUpperCase(),
  voteThreshold: z.number().int().min(1).max(100).default(60),
});

type NewTripValues = z.infer<typeof newTripSchema>;

export function NewTripForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<NewTripValues>({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      defaultCurrency: 'USD',
      voteThreshold: 60,
    },
  });

  async function onSubmit(values: NewTripValues) {
    setSubmitting(true);
    try {
      await createTripAction(values);
      // Action redirects on success
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create trip');
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summer Europe Tour"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>E.g., Summer Europe Tour, Weekend Ski Trip</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input
                  placeholder="Paris, France"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>Where are you going?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={submitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={submitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="defaultCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Default currency for costs and expenses</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voteThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vote threshold</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  disabled={submitting}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormDescription>
                Percentage of yes votes needed to approve a stop (default: 60%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating trip…' : 'Create trip'}
        </Button>
      </form>
    </Form>
  );
}
