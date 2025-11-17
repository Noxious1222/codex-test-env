import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        client: { agency: { ownerUserId: session.user.id } },
      },
      include: {
        client: {
          include: { agency: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const pdfContent = `Report ${report.id}\nClient: ${report.client.name}\nAgency: ${report.client.agency.name}`

    return new Response(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${report.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
