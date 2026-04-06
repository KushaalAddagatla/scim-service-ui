import { useEffect, useState } from 'react'
import { RefreshCw, User, Users } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'
import type { ProvisioningEvent } from '@/types/scim'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const EVENT_COLORS: Record<string, string> = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  PATCH: 'bg-purple-500',
  DEPROVISION: 'bg-orange-500',
}

function eventColor(type: string) {
  const key = Object.keys(EVENT_COLORS).find((k) => type.includes(k))
  return key ? EVENT_COLORS[key] : 'bg-gray-400'
}

function eventBadgeVariant(type: string): 'success' | 'default' | 'destructive' | 'secondary' | 'warning' {
  if (type.includes('CREATE')) return 'success'
  if (type.includes('DELETE') || type.includes('DEPROVISION')) return 'destructive'
  if (type.includes('UPDATE') || type.includes('PATCH')) return 'default'
  return 'secondary'
}

export function ProvisioningTimeline() {
  const [events, setEvents] = useState<ProvisioningEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'ALL' | 'User' | 'Group'>('ALL')

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ProvisioningEvent[]>('/api/events', {
        params: { limit: 100 },
      })
      setEvents(res.data)
    } catch {
      setError('Failed to load provisioning events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchEvents()
  }, [])

  const filtered =
    resourceTypeFilter === 'ALL'
      ? events
      : events.filter((e) => e.resourceType === resourceTypeFilter)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Provisioning Event Timeline</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time stream of SCIM provisioning operations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEvents}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Resource type filter */}
      <div className="flex gap-2">
        {(['ALL', 'User', 'Group'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setResourceTypeFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              resourceTypeFilter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'ALL' ? 'All Resources' : f + 's'}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No provisioning events found.</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-6">
              {filtered.map((ev) => (
                <li key={ev.id} className="ml-6">
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full ${eventColor(ev.eventType)} ring-4 ring-white`}
                  />

                  <div className="flex flex-wrap items-start gap-2">
                    <Badge variant={eventBadgeVariant(ev.eventType)}>
                      {ev.eventType}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {ev.resourceType === 'User' ? <User size={12} /> : <Users size={12} />}
                      {ev.resourceType}
                    </span>
                    {ev.source && (
                      <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                        via {ev.source}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-sm font-medium text-gray-800">
                      {ev.resourceName ?? ev.resourceId}
                    </p>
                    {ev.detail && (
                      <p className="text-xs text-gray-500">{ev.detail}</p>
                    )}
                    {ev.correlationId && (
                      <p className="text-xs font-mono text-gray-400">
                        correlation: {ev.correlationId}
                      </p>
                    )}
                  </div>

                  <time
                    className="mt-1 block text-xs text-gray-400"
                    title={format(new Date(ev.timestamp), 'PPpp')}
                  >
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
