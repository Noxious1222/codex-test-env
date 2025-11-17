'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

interface Client {
  id: string
  name: string
  industry?: string
  createdAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', industry: '' })
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClients()
    } else if (status === 'unauthenticated') {
      signIn()
    }
  }, [status])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ name: '', industry: '' })
        fetchClients()
      }
    } catch (error) {
      console.error('Create client error:', error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client list and generate reports.</p>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-blue-600 hover:text-blue-500"
          >
            Update agency
          </button>
        </div>

        <form onSubmit={createClient} className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add a new client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Client name"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="Industry (optional)"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create client
          </button>
        </form>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Client list</h2>
            <span className="text-sm text-gray-500">{clients.length} total</span>
          </div>
          {clients.length === 0 ? (
            <div className="p-6 text-gray-500">No clients yet. Add your first client above.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id} className="px-6 py-4 hover:bg-gray-50">
                  <Link href={`/clients/${client.id}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.industry || 'Industry not set'}</p>
                    </div>
                    <span className="text-sm text-gray-400">{new Date(client.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
