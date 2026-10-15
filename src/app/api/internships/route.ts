import { NextResponse, type NextRequest } from 'next/server';

import { apiError, cleanString, readJson, requireRole } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

interface InternshipPayload {
  title?: string;
  firm_name?: string;
  location?: string;
  description?: string;
  application_link?: string;
  deadline?: string;
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole(['admin']);
  if (authError) return authError;

  const payload = await readJson<InternshipPayload>(request);
  const title = cleanString(payload?.title, 200);
  const firmName = cleanString(payload?.firm_name, 200);

  if (!title) return apiError('A position title is required.');
  if (!firmName) return apiError('The organisation name is required.');

  const deadline = cleanString(payload?.deadline, 30);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('internships')
    .insert({
      title,
      firm_name: firmName,
      location: cleanString(payload?.location, 120),
      description: cleanString(payload?.description, 2000),
      application_link: cleanString(payload?.application_link, 1000),
      deadline: deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null
    })
    .select('*')
    .single();

  if (error) return apiError('The listing could not be saved.', 500);

  return NextResponse.json({ internship: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole(['admin']);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return apiError('A listing id is required.');

  const supabase = await createClient();
  const { error } = await supabase.from('internships').delete().eq('id', id);

  if (error) return apiError('The listing could not be deleted.', 500);

  return NextResponse.json({ deleted: id });
}
