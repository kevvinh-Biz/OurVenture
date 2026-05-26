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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { loginAction, signInWithGoogleAction } from '../actions';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'At least 8 characters.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      await loginAction(values);
      // loginAction redirects on success
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.');
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    try {
      await signInWithGoogleAction();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={submitting}>
          Continue with Google
        </Button>
      </form>
    </Form>
  );
}
