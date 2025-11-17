import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const report = await prisma.report.findFirst({
      where: {
        webViewSlug: params.slug,
      },
      include: {
        client: {
          include: {
            agency: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Return minimal data for public view
    const publicReport = {
      id: report.id,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      summaryJson: report.summaryJson,
      client: {
        name: report.client.name,
        industry: report.client.industry,
      },
      agency: {
        name: report.client.agency.name,
        logoUrl: report.client.agency.logoUrl,
        primaryColor: report.client.agency.primaryColor,
      },
    }

    return NextResponse.json(publicReport)
  } catch (error) {
    console.error('Get public report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
