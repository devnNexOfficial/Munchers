'use client'

/**
 * HOOK: useItemDetailModal
 * PURPOSE:   Manages open/closed state and the selected item for the
 *            item detail bottom sheet on the home screen.
 * DEPENDENCIES: MenuItem type (lib/queries/home)
 * SIDE EFFECTS: None — pure UI state.
 * PERFORMANCE: openModal and closeModal are memoized with useCallback
 *              so ItemCard callbacks are stable across parent re-renders.
 *              This prevents unnecessary ItemCard re-renders when the parent
 *              re-renders due to category changes or search queries.
 *
 * ENCAPSULATION: Exposes only { isOpen, selectedItem, openModal, closeModal }.
 *   Internal setState is hidden — callers cannot set arbitrary state.
 *
 * @returns isOpen       - Whether the modal is currently visible
 * @returns selectedItem - The MenuItem currently being shown, or null
 * @returns openModal    - Call with a MenuItem to open the modal for that item
 * @returns closeModal   - Call to close the modal and clear the selected item
 */

import { useCallback, useState } from 'react'

import type { MenuItem } from '@/lib/queries/home'

export function useItemDetailModal(): {
  isOpen: boolean
  selectedItem: MenuItem | null
  openModal: (item: MenuItem) => void
  closeModal: () => void
} {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  // isOpen is derived — avoids a separate boolean state that could get out of sync
  const isOpen = selectedItem !== null

  // useCallback: stable references prevent unnecessary re-renders of ItemCard
  const openModal = useCallback((item: MenuItem) => {
    setSelectedItem(item)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedItem(null)
  }, [])

  return { isOpen, selectedItem, openModal, closeModal }
}
