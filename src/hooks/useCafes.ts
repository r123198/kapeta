'use client'

import { useState, useEffect } from 'react'
import { getCafesFromSupabase, Cafe } from '@/lib/data'

export function useCafes() {
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCafesFromSupabase()
        setCafesList(data)
      } catch (err) {
        console.error('Failed to load cafes', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return { cafesList, isLoading }
}
