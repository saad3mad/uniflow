import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers });
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId, courseId } = await req.json();
    if (!moduleId || !courseId) {
      return NextResponse.json({ error: 'moduleId and courseId required' }, { status: 400 });
    }

    // 1. Update Supabase to mark as read
    const { error } = await supabase
      .from('moodle_course_contents')
      .update({ read: true })
      .eq('user_id', userRes.user.id)
      .eq('module_id', moduleId);
    
    if (error) throw error;

    // 2. Optional: Send to Moodle using completion API
    // This requires Moodle token and API call
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
