'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/app/(auth)/actions';

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOutAction();
      }}
    >
      <LogOut className="h-4 w-4" />
      <span className="ml-2">Sign out</span>
    </Button>
  );
}
