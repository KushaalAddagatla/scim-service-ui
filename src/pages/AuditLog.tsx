import { useEffect, useState } from 'react'
import { RefreshCw, Download } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'
import type { AuditLog as AuditLogEntry } from '@/types/scim'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PAGE_SIZE = 50

function exportCsv(rows: AuditLogEntry[]) {
  const headers = ['id', 'timestamp', 'action', 'outcome', 'actorId', 'targetUserId', 'targetGroupId', 'correlationId', 'detail']
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = String(r[h as keyof AuditLogEntry] ?? '')
          // Wrap in quotes if value contains comma, newline, or quote
          return val.includes(',') || val.includes('\n') || val.includes('"')
            ? `"${val.replace(/"/g, '""')}"`
            : val
        })
        .join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async (offset = 0, action = '') => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { offset, limit: PAGE_SIZE }
      if (action) params.action = action
      const res = await api.get<{ content: AuditLogEntry[]; totalElements: number }>('/api/audit', { params })
      setLogs(res.data.content)
      setTotal(res.data.totalElements)
      setStartIndex(offset)
    } catch {
      setError('Failed to load audit log.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLogs()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void fetchLogs(0, actionFilter)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">Immutable record of all SCIM operations with correlation IDs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv(logs)} disabled={logs.length === 0}>
            <Download size={14} />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(startIndex, actionFilter)}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Filter by action (e.g. CREATE_USER)…"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />
        <Button type="submit" size="sm">Filter</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Events ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="px-6 py-4 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-6 py-3 text-left font-medium">Action</th>
                  <th className="px-6 py-3 text-left font-medium">Outcome</th>
                  <th className="px-6 py-3 text-left font-medium">Target</th>
                  <th className="px-6 py-3 text-left font-medium">Correlation ID</th>
                  <th className="px-6 py-3 text-left font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM d HH:mm:ss')}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-800">{log.action}</td>
                      <td className="px-6 py-3">
                        <Badge variant={log.outcome === 'SUCCESS' ? 'success' : 'destructive'}>
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs font-mono text-gray-600">
                        {log.targetUserId ?? log.targetGroupId ?? '—'}
                      </td>
                      <td className="px-6 py-3 text-xs font-mono text-gray-400 max-w-[160px] truncate" title={log.correlationId}>
                        {log.correlationId}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={log.detail}>
                        {log.detail ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={startIndex === 0}
              onClick={() => fetchLogs(startIndex - PAGE_SIZE, actionFilter)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={startIndex + PAGE_SIZE >= total}
              onClick={() => fetchLogs(startIndex + PAGE_SIZE, actionFilter)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
