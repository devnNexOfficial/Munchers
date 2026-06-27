'use client'

import { useState } from 'react'

export function PhoneOtpForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  return (
    <form className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-black text-muncherz-black">Login</h1>
      <p className="mb-6 text-sm font-medium text-gray-500">Enter your phone number to continue.</p>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">Phone number</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+92 300 1234567"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      {otpSent ? (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-bold text-gray-700">OTP</span>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="123456"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
          />
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setOtpSent(true)}
        className="w-full rounded-md bg-muncherz-red px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
      >
        {otpSent ? 'Verify OTP' : 'Send OTP'}
      </button>
    </form>
  )
}
