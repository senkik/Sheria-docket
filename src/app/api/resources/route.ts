import { NextResponse, type NextRequest } from 'next/server';

import { apiError, cleanString, readJson, requireRole } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

interface ResourcePayload {
  title?: string;
  description?: string;
  file_url?: string;
  category?: string;
}

export async function POST(request: NextRequest) {
  const { profile, error: authError } = await requireRole(['admin']);
  if (authError) return authError;

  const payload = await readJson<ResourcePayload>(request);
  const title = cleanString(payload?.title, 200);
  const fileUrl = cleanString(payload?.file_url, 1000);

  if (!title) return apiError('A resource title is required.');
  if (!fileUrl) return apiError('A download link is required.');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title,
      file_url: fileUrl,
      description: cleanString(payload?.description, 600),
      category: cleanString(payload?.category, 60),
      uploaded_by: profile.id
    })
    .select('*')
    .single();

  if (error) return apiError('The resource could not be saved.', 500);

  return NextResponse.json({ resource: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole(['admin']);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return apiError('A resource id is required.');

  const supabase = await createClient();
  const { error } = await supabase.from('resources').delete().eq('id', id);

  if (error) return apiError('The resource could not be deleted.', 500);

  return NextResponse.json({ deleted: id });
}
