'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface RestaurantStatusContextType {
  isRestaurantClosed: boolean
  setIsRestaurantClosed: (closed: boolean) => void
}

const RestaurantStatusContext = createContext<RestaurantStatusContextType>({
  isRestaurantClosed: false,
  setIsRestaurantClosed: () => {},
})

export function RestaurantStatusProvider({ children }: { children: ReactNode }) {
  const [isRestaurantClosed, setIsRestaurantClosed] = useState(false)
  const value = useMemo(
    () => ({ isRestaurantClosed, setIsRestaurantClosed }),
    [isRestaurantClosed]
  )

  return (
    <RestaurantStatusContext.Provider value={value}>
      {children}
    </RestaurantStatusContext.Provider>
  )
}

export function useRestaurantStatus() {
  return useContext(RestaurantStatusContext)
}
