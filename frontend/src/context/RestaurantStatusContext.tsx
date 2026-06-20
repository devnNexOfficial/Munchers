'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

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

  return (
    <RestaurantStatusContext.Provider value={{ isRestaurantClosed, setIsRestaurantClosed }}>
      {children}
    </RestaurantStatusContext.Provider>
  )
}

export function useRestaurantStatus() {
  return useContext(RestaurantStatusContext)
}
