import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      where: {
        agency: {
          ownerUserId: session.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('List clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, industry, notes } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const agency = await prisma.agency.findUnique({ where: { ownerUserId: session.user.id } })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        industry,
        notes,
        agencyId: agency.id,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
