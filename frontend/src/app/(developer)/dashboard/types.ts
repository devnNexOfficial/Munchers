export interface AppHealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  checked_at: string
}

export interface ActiveUsersCount {
  count: number
}

export interface ErrorLogEntry {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  route: string
  message: string
  created_at: string
}

export interface ErrorLogFilters {
  severity?: string
  route?: string
  from?: string
  to?: string
}

export interface PaymentSuccessRate {
  paid: number
  total: number
  percentage: number
}

export interface DbStatus {
  status: 'healthy' | 'degraded' | 'down'
  latency_ms: number | null
}

export interface ActivityLogEntry {
  id: string
  actor_id: string
  actor_role: string
  action: string
  entity: string
  entity_id: string
  old_value: unknown
  new_value: unknown
  ip_address: string | null
  created_at: string
}
