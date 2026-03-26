import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/t-panel';
  const role = searchParams.get('role') ?? 'transportista';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For OAuth signups (Google), ensure the user has the correct role
      // The trigger `handle_new_user` uses raw_user_meta_data.role,
      // but Google OAuth doesn't set that — so we fix it here.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if users table row exists (trigger should have created it)
        const { data: userRow } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (userRow) {
          // If this is a new OAuth user, the trigger defaulted to 'transportista'
          // Update to the requested role if different
          if (role === 'cargador' && userRow.role !== 'cargador') {
            await supabase
              .from('users')
              .update({ role: 'cargador' })
              .eq('id', user.id);
          }
        }

        // Update user metadata with role (for future reference)
        await supabase.auth.updateUser({
          data: { role },
        });
      }

      // Redirect based on role
      const redirectPath =
        role === 'cargador' ? '/c-panel' : next;

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/iniciar-sesion?error=auth_callback_failed`
  );
}
