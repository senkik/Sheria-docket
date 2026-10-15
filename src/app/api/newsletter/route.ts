import { NextResponse } from 'next/server';

import { apiError, readJson } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { isEmail } from '@/lib/utils';

interface NewsletterPayload {
  email?: string;
}

export async function POST(request: Request) {
  const payload = await readJson<NewsletterPayload>(request);
  const email = payload?.email?.trim().toLowerCase();

  if (!email || !isEmail(email)) {
    return apiError('Enter a valid email address.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('subscribers').insert({ email });

  // Repeated subscriptions are treated as success so the reader sees no error.
  if (error && error.code !== '23505') {
    return apiError('Could not record your subscription. Try again shortly.', 500);
  }

  return NextResponse.json({ message: 'Subscribed.' }, { status: 201 });
}
