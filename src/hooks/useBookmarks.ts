'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { recordCommunityCurationSignal } from '@/lib/ownerStudio'

export interface CafeCuration {
  cafeId: string
  coffeeQuality: 'Everyday Good' | 'Specialty Great' | 'Exceptional Brew'
  workFriendly: 'Great for Deep Work' | 'Casual Laptop Spot' | 'Best for Unplugging'
  vibes: string[]
  recommendations: string[]
  mustOrder?: string
  experienceNote?: string
  updatedAt: string
}

function getLocalBookmarks(userId: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`root_bookmarks_${userId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setLocalBookmarks(userId: string, ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`root_bookmarks_${userId}`, JSON.stringify(ids))
  } catch {
    // Ignore storage errors
  }
}

function getLocalCurations(userId: string): Record<string, CafeCuration> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(`root_curations_${userId}`)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function setLocalCurations(userId: string, curations: Record<string, CafeCuration>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`root_curations_${userId}`, JSON.stringify(curations))
  } catch {
    // Ignore storage errors
  }
}

export async function getSavedBookmarkIdsForUser(user: any): Promise<string[]> {
  if (!user?.id) return []
  const localIds = getLocalBookmarks(user.id)
  const metaIds = Array.isArray(user.user_metadata?.bookmarks)
    ? user.user_metadata.bookmarks
    : []
  const merged = Array.from(new Set([...localIds, ...metaIds]))
  setLocalBookmarks(user.id, merged)
  return merged
}

export function useBookmarks(userId: string | null) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [curations, setCurations] = useState<Record<string, CafeCuration>>({})
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false)

  const syncToUserMetadata = useCallback(
    (uid: string, ids: string[], nextCurations?: Record<string, CafeCuration>) => {
      setLocalBookmarks(uid, ids)
      if (nextCurations) {
        setLocalCurations(uid, nextCurations)
      }
      // Run asynchronously outside render/lock
      setTimeout(() => {
        const payload: Record<string, any> = { bookmarks: ids }
        if (nextCurations) {
          payload.curations = nextCurations
        }
        supabase.auth
          .updateUser({
            data: payload,
          })
          .catch(() => {})
      }, 0)
    },
    []
  )

  const loadBookmarks = useCallback(
    async (uid?: string) => {
      const id = uid || userId
      if (!id) {
        setBookmarkedIds([])
        setCurations({})
        setBookmarksLoaded(true)
        return []
      }

      // Immediately hydrate from localStorage so UI never blocks on network
      const localIds = getLocalBookmarks(id)
      const localCurations = getLocalCurations(id)
      setBookmarkedIds(localIds)
      setCurations(localCurations)
      setBookmarksLoaded(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const metaIds: string[] = Array.isArray(session?.user?.user_metadata?.bookmarks)
          ? session.user.user_metadata.bookmarks
          : []
        const metaCurations: Record<string, CafeCuration> =
          session?.user?.user_metadata?.curations &&
          typeof session.user.user_metadata.curations === 'object'
            ? session.user.user_metadata.curations
            : {}

        const mergedIds = Array.from(new Set([...localIds, ...metaIds]))
        const mergedCurations = { ...metaCurations, ...localCurations }

        setLocalBookmarks(id, mergedIds)
        setLocalCurations(id, mergedCurations)
        setBookmarkedIds(mergedIds)
        setCurations(mergedCurations)
        return mergedIds
      } catch {
        return localIds
      }
    },
    [userId]
  )

  const saveCafeWithCuration = useCallback(
    async (
      cafeId: string,
      curationInput: Omit<CafeCuration, 'cafeId' | 'updatedAt'>
    ) => {
      if (!userId) return false

      const nextIds = bookmarkedIds.includes(cafeId)
        ? bookmarkedIds
        : [...bookmarkedIds, cafeId]

      const newCuration: CafeCuration = {
        ...curationInput,
        cafeId,
        updatedAt: new Date().toISOString(),
      }

      const nextCurations: Record<string, CafeCuration> = {
        ...curations,
        [cafeId]: newCuration,
      }

      recordCommunityCurationSignal(newCuration)
      setBookmarkedIds(nextIds)
      setCurations(nextCurations)
      syncToUserMetadata(userId, nextIds, nextCurations)
      return true
    },
    [userId, bookmarkedIds, curations, syncToUserMetadata]
  )

  const toggleBookmark = useCallback(
    async (cafeId: string) => {
      if (!userId) return false

      const exists = bookmarkedIds.includes(cafeId)
      const nextIds = exists
        ? bookmarkedIds.filter((id) => id !== cafeId)
        : [...bookmarkedIds, cafeId]

      setBookmarkedIds(nextIds)
      syncToUserMetadata(userId, nextIds)
      return true
    },
    [userId, bookmarkedIds, syncToUserMetadata]
  )

  const removeBookmark = useCallback(
    async (cafeId: string) => {
      if (!userId) return false

      const nextIds = bookmarkedIds.filter((id) => id !== cafeId)
      setBookmarkedIds(nextIds)
      syncToUserMetadata(userId, nextIds)
      return true
    },
    [userId, bookmarkedIds, syncToUserMetadata]
  )

  const isBookmarked = useCallback(
    (cafeId: string) => {
      return bookmarkedIds.includes(cafeId)
    },
    [bookmarkedIds]
  )

  const getCuration = useCallback(
    (cafeId: string): CafeCuration | undefined => {
      return curations[cafeId]
    },
    [curations]
  )

  const addBookmarkIfMissing = useCallback(
    async (cafeId: string) => {
      if (!userId) return
      if (bookmarkedIds.includes(cafeId)) return

      const nextIds = [...bookmarkedIds, cafeId]
      setBookmarkedIds(nextIds)
      syncToUserMetadata(userId, nextIds)
    },
    [userId, bookmarkedIds, syncToUserMetadata]
  )

  return {
    bookmarkedIds,
    curations,
    bookmarksLoaded,
    loadBookmarks,
    saveCafeWithCuration,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
    getCuration,
    addBookmarkIfMissing,
  }
}
