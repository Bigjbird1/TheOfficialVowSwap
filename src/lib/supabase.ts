import { createClient } from '@supabase/supabase-js'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { NextResponse, NextRequest } from 'next/server'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'X-Client-Info': 'vowswap-marketplace',
    },
    fetch: (...args) => {
      return fetch(...args).catch(error => {
        console.error('Supabase client error:', error)
        throw error
      })
    }
  }
})

// Helper to check if we're running on the server side
export const isServer = () => typeof window === 'undefined'

// Create middleware client
export const createServerSupabase = (req: NextRequest) => {
  const res = NextResponse.next()
  return createMiddlewareClient({ req, res })
}

// Helper to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching session:', error.message)
    return null
  }
  return session
}

// Helper to get user profile with role
export const getUserProfile = async () => {
  const session = await getSession()
  if (!session?.user?.id) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, roles(*)')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching user profile:', profileError.message)
    return null
  }

  return profile
}

// Helper to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

// Types
export type Profile = Awaited<ReturnType<typeof getUserProfile>>
