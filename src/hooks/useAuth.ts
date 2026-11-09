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
    let isMounted = true

    async function fetchProfileRole(userId: string, defaultRole?: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        return data?.role || defaultRole || 'user'
      } catch {
        return defaultRole || 'user'
      }
    }

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return
        if (session?.user) {
          const initialRole = session.user.user_metadata?.role || 'user'
          setState({ user: session.user, role: initialRole, loading: false })
          setTimeout(() => {
            fetchProfileRole(session.user.id, initialRole).then((resolvedRole) => {
              if (isMounted) {
                setState((prev) => ({ ...prev, role: resolvedRole, loading: false }))
              }
            })
          }, 0)
        } else {
          setState({ user: null, role: null, loading: false })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ user: null, role: null, loading: false })
        }
      })

    // Listen to auth state changes WITHOUT awaiting inside the callback (prevents Supabase lock deadlock)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (session?.user) {
        const initialRole = session.user.user_metadata?.role || 'user'
        setState({ user: session.user, role: initialRole, loading: false })
        setTimeout(() => {
          fetchProfileRole(session.user.id, initialRole).then((resolvedRole) => {
            if (isMounted) {
              setState((prev) => ({ ...prev, role: resolvedRole, loading: false }))
            }
          })
        }, 0)
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    return () => {
      isMounted = false
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
