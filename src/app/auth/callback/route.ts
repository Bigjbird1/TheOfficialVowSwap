import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the redirect URL from the stored state
      const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // If there's no code or an error occurred, redirect to sign-in
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
