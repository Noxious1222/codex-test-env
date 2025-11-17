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

    const agency = await prisma.agency.findUnique({
      where: { ownerUserId: session.user.id },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    return NextResponse.json(agency)
  } catch (error) {
    console.error('Get agency error:', error)
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
    const { name, logoUrl, primaryColor } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const agency = await prisma.agency.upsert({
      where: { ownerUserId: session.user.id },
      update: {
        name,
        logoUrl,
        primaryColor,
      },
      create: {
        ownerUserId: session.user.id,
        name,
        logoUrl,
        primaryColor,
      },
    })

    return NextResponse.json(agency, { status: 201 })
  } catch (error) {
    console.error('Create agency error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
