import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddStopForm } from './add-stop-form';

export const metadata: Metadata = { title: 'Add stop' };

export default function AddStopPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add a stop</h1>
        <p className="text-sm text-muted-foreground">
          Add a place to your itinerary. Other members will vote on whether to include it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stop details</CardTitle>
          <CardDescription>
            Give the stop a name, set a time, and provide any helpful details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddStopForm params={params} />
        </CardContent>
      </Card>
    </div>
  );
}
