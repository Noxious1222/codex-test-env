'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ReportData {
  id: string
  periodStart: string
  periodEnd: string
  status: string
  webViewSlug: string
  summaryJson: {
    metrics: {
      spend: number
      clicks: number
      impressions: number
      conversions: number
      cpc: number
      cpa: number
      roas: number
    }
    channels: Array<{
      channel: string
      spend: number
      clicks: number
      impressions: number
      conversions: number
      cpc: number
      cpa: number
      roas: number
    }>
    commentary: string
  }
  client: {
    name: string
    agency: {
      name: string
      logoUrl?: string
      primaryColor?: string
    }
  }
}

export default function ReportView() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [commentary, setCommentary] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReport()
    }
  }, [status, params.id])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
        setCommentary(data.summaryJson.commentary || '')
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    }
  }

  const saveCommentary = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentary }),
      })

      if (response.ok) {
        setIsEditing(false)
        // Refresh report data
        fetchReport()
      }
    } catch (error) {
      console.error('Failed to save commentary:', error)
    } finally {
      setSaving(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `report-${params.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const copyShareLink = async () => {
    if (!report) return
    
    const shareUrl = `${window.location.origin}/share/${report.webViewSlug}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!report) {
    return <div>Loading...</div>
  }

  const primaryColor = report.client.agency.primaryColor || '#3B82F6'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: primaryColor }}>
            <div className="flex items-center space-x-4">
              {report.client.agency.logoUrl && (
                <img 
                  src={report.client.agency.logoUrl} 
                  alt={report.client.agency.name}
                  className="h-10"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {report.client.agency.name}
                </h1>
                <p className="text-gray-600">
                  Performance Report for {report.client.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyShareLink}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {copied ? 'Copied!' : 'Copy Share Link'}
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">Spend</div>
              <div className="text-2xl font-bold">${report.summaryJson.metrics.spend.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">Clicks</div>
              <div className="text-2xl font-bold">{report.summaryJson.metrics.clicks.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">Conversions</div>
              <div className="text-2xl font-bold">{report.summaryJson.metrics.conversions.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">CPC</div>
              <div className="text-2xl font-bold">${report.summaryJson.metrics.cpc.toFixed(2)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">CPA</div>
              <div className="text-2xl font-bold">${report.summaryJson.metrics.cpa.toFixed(2)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: primaryColor }}>
              <div className="text-sm text-gray-500">ROAS</div>
              <div className="text-2xl font-bold">{report.summaryJson.metrics.roas.toFixed(1)}x</div>
            </div>
          </div>

          {/* Channel Breakdown */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Channel Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROAS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.summaryJson.channels.map((channel, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {channel.channel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${channel.spend.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {channel.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {channel.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {channel.conversions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${channel.cpc.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${channel.cpa.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {channel.roas.toFixed(1)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commentary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Analysis & Recommendations</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Edit
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setCommentary(report.summaryJson.commentary || '')
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCommentary}
                    disabled={saving}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your analysis and recommendations here..."
                />
              ) : (
                <div className="prose max-w-none">
                  {commentary ? (
                    <p className="whitespace-pre-wrap">{commentary}</p>
                  ) : (
                    <p className="text-gray-500 italic">No commentary added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
