import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { format, isPast } from 'date-fns'
import api from '@/lib/api'
import type { CertificationCampaign } from '@/types/scim'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CampaignStatus = CertificationCampaign['status']

const statusVariant: Record<CampaignStatus, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  EXPIRED: 'destructive',
}

export function CertificationCampaigns() {
  const [campaigns, setCampaigns] = useState<CertificationCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<CampaignStatus | 'ALL'>('ALL')

  const fetchCampaigns = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<CertificationCampaign[]>('/api/certifications')
      setCampaigns(res.data)
    } catch {
      setError('Failed to load certification campaigns.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCampaigns()
  }, [])

  const filtered =
    activeFilter === 'ALL'
      ? campaigns
      : campaigns.filter((c) => c.status === activeFilter)

  const counts = (['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED'] as const).map((s) => ({
    label: s === 'ALL' ? 'All' : s.replace('_', ' '),
    value: s,
    count: s === 'ALL' ? campaigns.length : campaigns.filter((c) => c.status === s).length,
  }))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certification Campaigns</h2>
          <p className="text-sm text-gray-500 mt-0.5">Access review cycles — SOC2 CC6.3 / HIPAA Minimum Necessary</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCampaigns}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {counts.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="px-6 py-4 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Campaign</th>
                  <th className="px-6 py-3 text-left font-medium">Target User</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Decision</th>
                  <th className="px-6 py-3 text-left font-medium">Deadline</th>
                  <th className="px-6 py-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.id}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                        {c.targetUserId ?? '—'}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[c.status]}>{c.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-3">
                        {c.decision ? (
                          <Badge variant={c.decision === 'APPROVE' ? 'success' : 'destructive'}>
                            {c.decision}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs">
                        <span className={isPast(new Date(c.deadline)) && c.status !== 'COMPLETED' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {format(new Date(c.deadline), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {format(new Date(c.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
