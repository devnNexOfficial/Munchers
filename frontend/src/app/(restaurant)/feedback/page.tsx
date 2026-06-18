'use client'

import React, { useState } from 'react'

import { MessageSquare, Star, ThumbsDown, ThumbsUp } from 'lucide-react'

type Sentiment = 'positive' | 'negative' | 'neutral'

interface FeedbackEntry {
  id: string
  customer: string
  phone: string
  orderId: string
  rating: number
  comment: string
  sentiment: Sentiment
  timestamp: string
  replied: boolean
}

const MOCK_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'fb-001',
    customer: 'Hamza Sheikh',
    phone: '+92 300 1112233',
    orderId: 'A4F91C',
    rating: 5,
    comment: 'Absolutely incredible smash burger! The beef patty was perfectly juicy and the brioche bun was toasted just right. Will order again without hesitation.',
    sentiment: 'positive',
    timestamp: '2026-06-18 16:45',
    replied: false,
  },
  {
    id: 'fb-002',
    customer: 'Sara Malik',
    phone: '+92 312 4445566',
    orderId: 'B7E33A',
    rating: 3,
    comment: 'Food was decent but delivery took longer than expected. The fries were cold by the time they arrived.',
    sentiment: 'neutral',
    timestamp: '2026-06-18 15:30',
    replied: true,
  },
  {
    id: 'fb-003',
    customer: 'Ali Nawaz',
    phone: '+92 321 7778899',
    orderId: 'C2D84F',
    rating: 1,
    comment: 'Order was completely wrong. Received chicken wrap instead of beef burger. Very disappointed with the kitchen quality check.',
    sentiment: 'negative',
    timestamp: '2026-06-18 14:10',
    replied: false,
  },
  {
    id: 'fb-004',
    customer: 'Zara Ahmed',
    phone: '+92 333 2223344',
    orderId: 'D9G12B',
    rating: 5,
    comment: 'Best burger in the city! The customizer on the app is so cool, I love being able to see my burger build in real time.',
    sentiment: 'positive',
    timestamp: '2026-06-18 13:20',
    replied: false,
  },
  {
    id: 'fb-005',
    customer: 'Umar Farooq',
    phone: '+92 344 5556677',
    orderId: 'E5H44C',
    rating: 4,
    comment: 'Great taste and fast delivery. Portion size could be a little larger for the price.',
    sentiment: 'positive',
    timestamp: '2026-06-17 19:55',
    replied: true,
  },
]

const SENTIMENT_CONFIG = {
  positive: {
    icon: ThumbsUp,
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
    label: 'Positive',
  },
  negative: {
    icon: ThumbsDown,
    color: 'text-[#D62828]',
    bg: 'bg-[#D62828]/10 border-[#D62828]/20',
    label: 'Negative',
  },
  neutral: {
    icon: MessageSquare,
    color: 'text-[#F7B731]',
    bg: 'bg-[#F7B731]/10 border-[#F7B731]/20',
    label: 'Neutral',
  },
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-[#F7B731] fill-[#F7B731]' : 'text-neutral-700'}`}
        />
      ))}
    </div>
  )
}

type FilterVal = 'all' | Sentiment

export default function FeedbackPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>(MOCK_FEEDBACK)
  const [filter, setFilter] = useState<FilterVal>('all')
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.sentiment === filter)

  const handleReply = (id: string) => {
    if (!replyText.trim()) return
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, replied: true } : e))
    )
    setReplyingId(null)
    setReplyText('')
  }

  const avgRating =
    entries.reduce((acc, e) => acc + e.rating, 0) / entries.length

  return (
    <div className="space-y-8 text-white font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-[#D62828]" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">Feedback Log</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Customer reviews, ratings, and sentiment analysis for all orders.
            </p>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Rating', value: `${avgRating.toFixed(1)} / 5`, color: 'text-[#F7B731]' },
          { label: 'Positive', value: entries.filter((e) => e.sentiment === 'positive').length, color: 'text-[#22C55E]' },
          { label: 'Neutral', value: entries.filter((e) => e.sentiment === 'neutral').length, color: 'text-[#F7B731]' },
          { label: 'Negative', value: entries.filter((e) => e.sentiment === 'negative').length, color: 'text-[#D62828]' },
        ].map((s, i) => (
          <div key={i} className="bg-[#111111] border border-neutral-800 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
              {s.label}
            </span>
            <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'positive', 'neutral', 'negative'] as FilterVal[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer select-none ${
              filter === f
                ? f === 'negative'
                  ? 'bg-[#D62828] text-white shadow-[0_4px_12px_rgba(214,40,40,0.2)]'
                  : f === 'positive'
                  ? 'bg-[#22C55E] text-black'
                  : f === 'neutral'
                  ? 'bg-[#F7B731] text-black'
                  : 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {f === 'all' ? 'All Reviews' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Feedback cards */}
      <div className="space-y-4">
        {filtered.map((entry) => {
          const cfg = SENTIMENT_CONFIG[entry.sentiment]
          const SentIcon = cfg.icon
          const isReplying = replyingId === entry.id

          return (
            <div
              key={entry.id}
              className="bg-[#111111] border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700 transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#D62828]/15 border border-[#D62828]/25 flex items-center justify-center text-[#D62828] font-extrabold text-sm shrink-0">
                    {entry.customer.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{entry.customer}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {entry.phone} &middot; Order #{entry.orderId}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color}`}>
                    <SentIcon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                  {entry.replied && (
                    <span className="text-[9px] text-[#22C55E] font-bold uppercase tracking-wider">
                      Replied ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Rating + timestamp */}
              <div className="flex items-center justify-between">
                <StarRow rating={entry.rating} />
                <span className="text-[10px] text-neutral-600 font-mono">{entry.timestamp}</span>
              </div>

              {/* Comment */}
              <p className="text-xs text-neutral-300 leading-relaxed bg-[#0A0A0A] border border-neutral-900 rounded-lg p-3 italic">
                &ldquo;{entry.comment}&rdquo;
              </p>

              {/* Reply section */}
              {!entry.replied && (
                <div>
                  {isReplying ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply to the customer..."
                        rows={2}
                        className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-3 py-2.5 text-xs text-white outline-none resize-none transition-colors placeholder:text-neutral-600"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReply(entry.id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 bg-[#D62828] hover:bg-[#b52020] text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText('') }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingId(entry.id)}
                      className="text-[11px] font-bold text-neutral-400 hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
                    >
                      Reply to customer
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
