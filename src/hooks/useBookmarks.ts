'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useBookmarks(userId: string | null) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

  const loadBookmarks = useCallback(async (uid?: string) => {
    const id = uid || userId
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('cafe_id')
        .eq('user_id', id)

      if (!error && data) {
        setBookmarkedIds(data.map((row: any) => row.cafe_id))
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e)
    }
  }, [userId])

  const toggleBookmark = useCallback(async (cafeId: string) => {
    if (!userId) return false

    try {
      if (bookmarkedIds.includes(cafeId)) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('cafe_id', cafeId)

        if (!error) {
          setBookmarkedIds((prev) => prev.filter((id) => id !== cafeId))
          return true
        }
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: userId, cafe_id: cafeId })

        if (!error) {
          setBookmarkedIds((prev) => [...prev, cafeId])
          return true
        }
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err)
    }
    return false
  }, [userId, bookmarkedIds])

  const removeBookmark = useCallback(async (cafeId: string) => {
    if (!userId) return false

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('cafe_id', cafeId)

      if (!error) {
        setBookmarkedIds((prev) => prev.filter((id) => id !== cafeId))
        return true
      } else {
        console.error('Failed to delete bookmark', error)
      }
    } catch (err) {
      console.error(err)
    }
    return false
  }, [userId, bookmarkedIds])

  const isBookmarked = useCallback((cafeId: string) => {
    return bookmarkedIds.includes(cafeId)
  }, [bookmarkedIds])

  const addBookmarkIfMissing = useCallback(async (cafeId: string) => {
    if (!userId) return

    try {
      const { data: exists } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('cafe_id', cafeId)
        .maybeSingle()

      if (!exists) {
        await supabase.from('bookmarks').insert({
          user_id: userId,
          cafe_id: cafeId,
        })
        setBookmarkedIds((prev) => [...prev, cafeId])
      }
    } catch (err) {
      console.error(err)
    }
  }, [userId])

  return {
    bookmarkedIds,
    loadBookmarks,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
    addBookmarkIfMissing,
  }
}
