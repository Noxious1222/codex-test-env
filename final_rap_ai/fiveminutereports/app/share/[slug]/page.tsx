'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface PublicReport {
  id: string
  periodStart: string
  periodEnd: string
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
    industry?: string
  }
  agency: {
    name: string
    logoUrl?: string
    primaryColor?: string
  }
}

export default function PublicReportView() {
  const [report, setReport] = useState<PublicReport | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    fetchReport()
  }, [params.slug])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/public/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Failed to fetch public report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!report) {
    return <div>Report not found</div>
  }

  const primaryColor = report.agency.primaryColor || '#3B82F6'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: primaryColor }}>
            <div className="flex items-center space-x-4">
              {report.agency.logoUrl && (
                <img 
                  src={report.agency.logoUrl} 
                  alt={report.agency.name}
                  className="h-10"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {report.agency.name}
                </h1>
                <p className="text-gray-600">
                  Performance Report for {report.client.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                </p>
              </div>
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
          {report.summaryJson.commentary && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Analysis & Recommendations</h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{report.summaryJson.commentary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
