import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TripChecklistPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist</CardTitle>
        <CardDescription>
          Personal travel checklist (template + custom items) and organizer-only readiness rollup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Coming soon.</p>
      </CardContent>
    </Card>
  );
}
