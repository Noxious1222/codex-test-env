import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReportStatus } from '@prisma/client'
import { generateSlug } from '@/lib/utils'

function buildMockSummary() {
  return {
    metrics: {
      spend: 5000 + Math.floor(Math.random() * 5000),
      clicks: 20000 + Math.floor(Math.random() * 10000),
      impressions: 500000 + Math.floor(Math.random() * 200000),
      conversions: 200 + Math.floor(Math.random() * 150),
      cpc: 0.25,
      cpa: 20 + Math.random() * 10,
      roas: 4 + Math.random() * 2,
    },
    channels: [
      {
        channel: 'Google Ads',
        spend: 3200,
        clicks: 14000,
        impressions: 380000,
        conversions: 220,
        cpc: 0.23,
        cpa: 14.55,
        roas: 4.5,
      },
      {
        channel: 'Facebook Ads',
        spend: 1800,
        clicks: 7000,
        impressions: 200000,
        conversions: 80,
        cpc: 0.26,
        cpa: 22.5,
        roas: 3.8,
      },
    ],
    commentary: 'Performance remains steady. Consider reallocating budget toward the strongest channels.',
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      where: {
        client: {
          agency: {
            ownerUserId: session.user.id,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('List reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, periodStart, periodEnd } = body

    if (!clientId || !periodStart || !periodEnd) {
      return NextResponse.json({ error: 'Missing report details' }, { status: 400 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        agency: { ownerUserId: session.user.id },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const summaryJson = buildMockSummary()

    const report = await prisma.report.create({
      data: {
        clientId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: ReportStatus.success,
        generatedAt: new Date(),
        webViewSlug: generateSlug(),
        summaryJson,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
