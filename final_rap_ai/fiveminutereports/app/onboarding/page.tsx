'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#3B82F6')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const saveAgency = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logoUrl, primaryColor }),
      })

      if (res.ok) {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Save agency error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Set up your agency</h1>
        <p className="text-gray-600 mb-6">Add your branding details to personalize client reports.</p>

        <form className="space-y-4" onSubmit={saveAgency}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Agency name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Primary color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="mt-1 h-10 w-24 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
