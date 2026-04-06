import { useEffect, useState } from 'react'
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'
import type { ScimGroup, ScimListResponse } from '@/types/scim'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function GroupDirectory() {
  const [groups, setGroups] = useState<ScimGroup[]>([])
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ScimListResponse<ScimGroup>>('/scim/v2/Groups', {
        params: { count: 50 },
      })
      setGroups(res.data.Resources)
      setTotal(res.data.totalResults)
    } catch {
      setError('Failed to load groups.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchGroups()
  }, [])

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Directory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} groups total</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGroups}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="px-6 py-4 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Loading…</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">No groups found.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.id}>
                    <button
                      onClick={() => toggle(g.id)}
                      className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expandedId === g.id ? (
                          <ChevronDown size={14} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{g.displayName}</p>
                          <p className="text-xs text-gray-400 font-mono">{g.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {g.members?.length ?? 0} member{(g.members?.length ?? 0) !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(g.meta.lastModified), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </button>

                    {expandedId === g.id && (
                      <div className="bg-gray-50 border-t px-10 py-3">
                        {!g.members || g.members.length === 0 ? (
                          <p className="text-xs text-gray-400">No members.</p>
                        ) : (
                          <ul className="space-y-1">
                            {g.members.map((m) => (
                              <li key={m.value} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                <span className="font-mono">{m.display ?? m.value}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
