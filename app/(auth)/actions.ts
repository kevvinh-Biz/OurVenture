'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/db/schema';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = credentialsSchema.extend({
  name: z.string().min(1).max(80),
});

/**
 * Sign up with email/password.
 * 1. Create Supabase Auth user
 * 2. Insert row in profiles table
 * 3. Redirect to dashboard
 */
export async function signUpAction(input: z.infer<typeof signUpSchema>) {
  const { email, password, name } = signUpSchema.parse(input);

  const supabase = await createClient();

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Failed to create account');
  }

  const userId = data.user.id;

  try {
    // Insert profile row
    await db.insert(profiles).values({
      id: userId,
      displayName: name,
      homeCurrency: 'USD',
    });
  } catch (dbError) {
    // If profile insert fails, we've orphaned an auth user.
    // For MVP, just throw — in prod, would need cleanup.
    console.error('Profile creation failed:', dbError);
    throw new Error('Account created but profile setup failed. Please contact support.');
  }

  // Redirect to dashboard (session auto-established by Supabase)
  redirect('/dashboard');
}

/**
 * Sign in with email/password.
 * 1. Authenticate with Supabase
 * 2. Redirect to dashboard
 */
export async function loginAction(input: z.infer<typeof credentialsSchema>) {
  const { email, password } = credentialsSchema.parse(input);

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign in');
  }

  // Redirect to dashboard
  redirect('/dashboard');
}

/**
 * Sign out action.
 * 1. Clear session
 * 2. Redirect to login
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Google OAuth sign-in.
 * Supabase handles OAuth redirect flow.
 */
export async function signInWithGoogleAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    throw new Error(error?.message || 'Failed to sign in with Google');
  }

  redirect(data.url);
}
