'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { createStopAction } from '../actions';

const addStopSchema = z.object({
  title: z.string().min(1, 'Stop name is required').max(500),
  address: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  scheduledAt: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  durationMin: z.number().int().positive().optional(),
  costEstimate: z.string().optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  notes: z.string().max(2000).optional(),
});

type AddStopValues = z.infer<typeof addStopSchema>;

interface AddStopFormProps {
  params: Promise<{ id: string }>;
}

export function AddStopForm({ params }: AddStopFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tripId, setTripId] = useState<string>('');

  // Get trip ID from params
  params.then((p) => setTripId(p.id));

  const form = useForm<AddStopValues>({
    resolver: zodResolver(addStopSchema),
    defaultValues: {
      title: '',
      address: '',
      description: '',
      scheduledAt: '',
      durationMin: undefined,
      costEstimate: '',
      currency: 'USD',
      notes: '',
    },
  });

  async function onSubmit(values: AddStopValues) {
    if (!tripId) {
      toast.error('Trip not loaded');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createStopAction({
        tripId,
        title: values.title,
        address: values.address,
        description: values.description,
        scheduledAt: values.scheduledAt,
        durationMin: values.durationMin,
        costEstimate: values.costEstimate,
        currency: values.currency,
        notes: values.notes,
      });

      toast.success('Stop added! Members can now vote on it.');
      router.push(`/trips/${tripId}/itinerary`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add stop');
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stop name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Eiffel Tower"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>What&apos;s the name of this place?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="5 Avenue Anatole France, 75007 Paris, France"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Iconic iron lattice monument with panoramic city views"
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
          name="scheduledAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date and time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
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
          name="durationMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes, optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="120"
                  disabled={submitting}
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>How long do you plan to spend here?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="costEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost estimate (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    maxLength={3}
                    placeholder="EUR"
                    disabled={submitting}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Book tickets online in advance, go early to avoid crowds..."
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Adding stop…' : 'Add stop'}
        </Button>
      </form>
    </Form>
  );
}
