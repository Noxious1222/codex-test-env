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
        client: {
          agency: { ownerUserId: session.user.id },
        },
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

    return NextResponse.json(report)
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentary } = await request.json()

    const existing = await prisma.report.findFirst({
      where: {
        id: params.id,
        client: { agency: { ownerUserId: session.user.id } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const summaryJson = {
      ...existing.summaryJson,
      commentary,
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { summaryJson },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
