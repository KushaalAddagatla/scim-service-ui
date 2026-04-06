import { useEffect, useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'
import type { ScimUser, ScimListResponse } from '@/types/scim'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PAGE_SIZE = 20

export function UserDirectory() {
  const [users, setUsers] = useState<ScimUser[]>([])
  const [total, setTotal] = useState(0)
  const [startIndex, setStartIndex] = useState(1)
  const [filterQuery, setFilterQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (start = 1, filter = '') => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = {
        startIndex: start,
        count: PAGE_SIZE,
      }
      if (filter) params.filter = `userName co "${filter}"`
      const res = await api.get<ScimListResponse<ScimUser>>('/scim/v2/Users', { params })
      setUsers(res.data.Resources)
      setTotal(res.data.totalResults)
      setStartIndex(start)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void fetchUsers(1, filterQuery)
  }

  const primaryEmail = (u: ScimUser) =>
    u.emails?.find((e) => e.primary)?.value ?? u.emails?.[0]?.value ?? '—'

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Directory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} users total</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchUsers(startIndex, filterQuery)}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Filter by userName…"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
        <Button type="submit" size="sm">
          <Search size={14} />
          Search
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="px-6 py-4 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Username</th>
                  <th className="px-6 py-3 text-left font-medium">Display Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Last Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-gray-800">{u.userName}</td>
                      <td className="px-6 py-3 text-gray-700">
                        {u.displayName ?? (`${u.name?.givenName ?? ''} ${u.name?.familyName ?? ''}`.trim() || '—')}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{primaryEmail(u)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={u.active ? 'success' : 'destructive'}>
                          {u.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {format(new Date(u.meta.lastModified), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {startIndex}–{Math.min(startIndex + PAGE_SIZE - 1, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={startIndex <= 1}
              onClick={() => fetchUsers(startIndex - PAGE_SIZE, filterQuery)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={startIndex + PAGE_SIZE - 1 >= total}
              onClick={() => fetchUsers(startIndex + PAGE_SIZE, filterQuery)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
