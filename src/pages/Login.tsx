import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [token, setToken] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) return
    localStorage.setItem('scim_token', trimmed)
    navigate('/users', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border shadow-sm w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">SCIM Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter a signed JWT with <code className="bg-gray-100 px-1 rounded text-xs">scope: scim:provision</code> to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bearer Token
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              rows={5}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                       py-2 px-4 rounded-md transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400">
          Identity Provisioning Service · SCIM 2.0 RFC 7643 / 7644
        </p>
      </div>
    </div>
  )
}
