'use client'

import { useState } from 'react'

export function RestaurantLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-black text-muncherz-black">Restaurant Login</h1>
      <p className="mb-6 text-sm font-medium text-gray-500">Access the restaurant dashboard.</p>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      <button
        type="button"
        className="w-full rounded-md bg-muncherz-red px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
      >
        Login
      </button>
    </form>
  )
}
