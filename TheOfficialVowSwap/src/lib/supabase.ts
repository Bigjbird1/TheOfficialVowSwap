import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

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
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Enable automatic token refresh
    detectSessionInUrl: true // Enable detection of auth redirects
  },
  // Add global error handler
  global: {
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

// Helper to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching session:', error.message)
    return null
  }
  return session
}

// Helper to get user profile
export const getUserProfile = async () => {
  const session = await getSession()
  if (!session?.user?.id) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error.message)
    return null
  }

  return data
}
