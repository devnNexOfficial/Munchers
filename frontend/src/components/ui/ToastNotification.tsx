'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration?: number // ms, default 3500
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Config Map ──────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>
    bg: string
    border: string
    text: string
    iconColor: string
    glow: string
  }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#0d1f14]',
    border: 'border-[#22C55E]/30',
    text: 'text-[#22C55E]',
    iconColor: 'text-[#22C55E]',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#1f0d0d]',
    border: 'border-[#D62828]/35',
    text: 'text-[#ff6b6b]',
    iconColor: 'text-[#D62828]',
    glow: 'shadow-[0_0_20px_rgba(214,40,40,0.18)]',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-[#1f1900]',
    border: 'border-[#F7B731]/30',
    text: 'text-[#F7B731]',
    iconColor: 'text-[#F7B731]',
    glow: 'shadow-[0_0_20px_rgba(247,183,49,0.15)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#0d1520]',
    border: 'border-[#3B82F6]/30',
    text: 'text-[#93C5FD]',
    iconColor: 'text-[#3B82F6]',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
}

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const config = VARIANT_CONFIG[item.variant]
  const Icon = config.icon
  const duration = item.duration ?? 3500

  const dismiss = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onDismiss(item.id), 320)
  }, [exiting, item.id, onDismiss])

  // Enter animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(dismiss, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [dismiss, duration])

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={dismiss}
      style={{
        transition: 'opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: visible && !exiting ? 1 : 0,
        transform:
          exiting
            ? 'translateX(110%) scale(0.95)'
            : visible
            ? 'translateX(0) scale(1)'
            : 'translateX(110%) scale(0.92)',
      }}
      className={`
        group relative flex items-start gap-3 min-w-[280px] max-w-[380px]
        ${config.bg} border ${config.border} ${config.glow}
        rounded-xl px-4 py-3.5 cursor-pointer select-none
        backdrop-blur-sm
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${config.iconColor.replace('text-', 'bg-')}`} />

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
      </div>

      {/* Message */}
      <p className={`flex-1 text-xs font-semibold leading-snug ${config.text}`}>
        {item.message}
      </p>

      {/* Dismiss X */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        className="shrink-0 mt-0.5 text-neutral-600 hover:text-neutral-400 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
        <div
          className={`h-full ${config.iconColor.replace('text-', 'bg-')} opacity-40`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard item={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => {
        // Cap stack at 5
        const next = prev.length >= 5 ? prev.slice(-4) : prev
        return [...next, { id, message, variant, duration }]
      })
    },
    []
  )

  const success = useCallback((m: string, d?: number) => toast(m, 'success', d), [toast])
  const error   = useCallback((m: string, d?: number) => toast(m, 'error', d), [toast])
  const warning = useCallback((m: string, d?: number) => toast(m, 'warning', d), [toast])
  const info    = useCallback((m: string, d?: number) => toast(m, 'info', d), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>. Wrap your layout with <ToastProvider>.')
  }
  return ctx
}
