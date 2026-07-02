'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any
  role: string | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    async function fetchProfile(userId: string, defaultRole?: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        return data?.role || defaultRole || 'managers'
      } catch {
        return defaultRole || 'managers'
      }
    }

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchProfile(session.user.id, session.user.user_metadata?.role)
        setState({ user: session.user, role, loading: false })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchProfile(session.user.id, session.user.user_metadata?.role)
        setState({ user: session.user, role, loading: false })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setState({ user: null, role: null, loading: false })
  }

  return {
    user: state.user,
    role: state.role,
    loading: state.loading,
    logout,
  }
}
