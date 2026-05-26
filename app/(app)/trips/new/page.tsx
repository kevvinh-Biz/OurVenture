import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewTripForm } from './new-trip-form';

export const metadata: Metadata = { title: 'New trip' };

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a trip</h1>
        <p className="text-sm text-muted-foreground">
          Set up the basics now — invite people, add stops, and tune settings on the next screens.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip details</CardTitle>
          <CardDescription>
            Name your trip, set the dates, and choose a default currency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewTripForm />
        </CardContent>
      </Card>
    </div>
  );
}
