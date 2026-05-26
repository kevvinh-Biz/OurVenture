'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface InviteModalProps {
  tripId: string;
  inviteCode: string;
}

export function InviteModal({ tripId, inviteCode }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${inviteCode}`;

  function copyToClipboard() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Invite members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite members to trip</DialogTitle>
          <DialogDescription>
            Share this link with anyone you want to add to the trip. They can join as a member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="ml-1">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="ml-1">Copy</span>
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p>
              <strong>Invite code:</strong> {inviteCode}
            </p>
            <p className="mt-1">Anyone with this link can join the trip.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
