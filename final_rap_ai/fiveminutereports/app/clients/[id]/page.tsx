'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Client {
  id: string
  name: string
  industry?: string
  notes?: string
  reports: Report[]
}

interface Report {
  id: string
  periodStart: string
  periodEnd: string
  status: string
  createdAt: string
}

export default function ClientDetail() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClient()
    }
  }, [status, params.id])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      // Generate report for last month
      const periodStart = new Date()
      periodStart.setMonth(periodStart.getMonth() - 1)
      periodStart.setDate(1)
      
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth())
      periodEnd.setDate(0)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: params.id,
          periodStart: periodStart.toISOString().split('T')[0],
          periodEnd: periodEnd.toISOString().split('T')[0],
        }),
      })

      if (response.ok) {
        const report = await response.json()
        router.push(`/reports/${report.id}`)
      } else {
        alert('Failed to generate report')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            {client.industry && (
              <p className="text-gray-600 mt-1">{client.industry}</p>
            )}
            {client.notes && (
              <p className="text-gray-600 mt-2">{client.notes}</p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reports</h2>
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {client.reports.length === 0 ? (
              <p className="text-gray-500">No reports yet. Generate your first report.</p>
            ) : (
              <div className="space-y-4">
                {client.reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {new Date(report.periodStart).toLocaleDateString()} -{' '}
                          {new Date(report.periodEnd).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-blue-600 hover:text-blue-500">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
