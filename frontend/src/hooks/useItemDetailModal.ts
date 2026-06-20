'use client'

import { useCallback, useState } from 'react'

import type { MenuItem } from '@/lib/queries/home'

export function useItemDetailModal() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const isOpen = selectedItem !== null

  const openModal = useCallback((item: MenuItem) => {
    setSelectedItem(item)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedItem(null)
  }, [])

  return { isOpen, selectedItem, openModal, closeModal }
}
