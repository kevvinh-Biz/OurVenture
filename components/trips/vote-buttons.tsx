'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { voteOnStopAction } from '@/app/(app)/trips/[id]/itinerary/actions';

interface VoteButtonsProps {
  stopId: string;
  tripId: string;
  currentVote?: 'yes' | 'no' | 'maybe';
  yesCount: number;
  noCount: number;
  maybeCount: number;
  threshold: number;
  totalMembers: number;
  onVoteChange?: () => void;
}

export function VoteButtons({
  stopId,
  tripId,
  currentVote,
  yesCount,
  noCount,
  maybeCount,
  threshold,
  totalMembers,
  onVoteChange,
}: VoteButtonsProps) {
  const [voting, setVoting] = useState(false);

  const votesNeeded = Math.ceil((threshold / 100) * totalMembers);
  const approvalPercent = totalMembers > 0 ? ((yesCount / totalMembers) * 100).toFixed(0) : '0';

  async function handleVote(vote: 'yes' | 'no' | 'maybe') {
    if (voting) return;

    setVoting(true);
    try {
      await voteOnStopAction({ stopId, tripId, vote });
      toast.success(`Vote recorded: ${vote}`);
      onVoteChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentVote === 'yes' ? 'default' : 'outline'}
          onClick={() => handleVote('yes')}
          disabled={voting}
          className="flex-1"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Yes ({yesCount})
        </Button>
        <Button
          size="sm"
          variant={currentVote === 'no' ? 'default' : 'outline'}
          onClick={() => handleVote('no')}
          disabled={voting}
          className="flex-1"
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          No ({noCount})
        </Button>
        <Button
          size="sm"
          variant={currentVote === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleVote('maybe')}
          disabled={voting}
          className="flex-1"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Maybe ({maybeCount})
        </Button>
      </div>

      <div className="space-y-1 rounded-lg bg-muted p-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium">Approval: {approvalPercent}%</span>
          <span className="text-muted-foreground">
            {yesCount} of {votesNeeded} needed ({threshold}% threshold)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-background">
          <div
            className={`h-full transition-all ${
              yesCount >= votesNeeded ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min((yesCount / votesNeeded) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
