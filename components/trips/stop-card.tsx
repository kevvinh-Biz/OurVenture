'use client';

import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoteButtons } from './vote-buttons';

interface StopCardProps {
  stopId: string;
  tripId: string;
  title: string;
  address?: string;
  scheduledAt?: string;
  costEstimate?: string;
  currency?: string;
  status: 'proposed' | 'approved' | 'rejected' | 'skipped';
  description?: string;
  yesVotes: number;
  noVotes: number;
  maybeVotes: number;
  currentUserVote?: 'yes' | 'no' | 'maybe';
  threshold: number;
  totalMembers: number;
  onVoteChange?: () => void;
}

export function StopCard({
  stopId,
  tripId,
  title,
  address,
  scheduledAt,
  costEstimate,
  currency,
  status,
  description,
  yesVotes,
  noVotes,
  maybeVotes,
  currentUserVote,
  threshold,
  totalMembers,
  onVoteChange,
}: StopCardProps) {
  const statusColors: Record<string, string> = {
    proposed: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    skipped: 'bg-gray-100 text-gray-800',
  };

  const scheduledTime = scheduledAt
    ? new Date(scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const scheduledDate = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {address && (
              <CardDescription className="mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {address}
              </CardDescription>
            )}
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        <div className="flex flex-wrap gap-4 text-sm">
          {scheduledTime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {scheduledDate} at {scheduledTime}
              </span>
            </div>
          )}

          {costEstimate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>
                {costEstimate} {currency}
              </span>
            </div>
          )}
        </div>

        {status === 'proposed' && (
          <VoteButtons
            stopId={stopId}
            tripId={tripId}
            currentVote={currentUserVote}
            yesCount={yesVotes}
            noCount={noVotes}
            maybeCount={maybeVotes}
            threshold={threshold}
            totalMembers={totalMembers}
            onVoteChange={onVoteChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
