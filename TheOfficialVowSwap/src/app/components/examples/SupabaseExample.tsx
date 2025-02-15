import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/app/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function SupabaseExample() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        // Example of how to use Supabase client to fetch data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(10)

        if (error) {
          throw error
        }

        setProfiles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Example of real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Change received!', payload)
          // Handle the change here
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Profiles</h2>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{profile.full_name}</h3>
            <p className="text-gray-600">{profile.email}</p>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={`${profile.full_name}'s avatar`}
                className="w-10 h-10 rounded-full mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
