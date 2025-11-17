import { PrismaClient, ReportStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { generateSlug } from '@/lib/utils'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'founder@example.com' },
    update: {},
    create: {
      email: 'founder@example.com',
      passwordHash,
    },
  })

  const agency = await prisma.agency.upsert({
    where: { ownerUserId: user.id },
    update: {},
    create: {
      ownerUserId: user.id,
      name: 'Acme Marketing',
      logoUrl: 'https://placehold.co/100x40?text=Acme',
      primaryColor: '#2563EB',
    },
  })

  const client = await prisma.client.upsert({
    where: { id: 'demo-client' },
    update: {
      agencyId: agency.id,
    },
    create: {
      id: 'demo-client',
      agencyId: agency.id,
      name: 'Umbrella Corp',
      industry: 'Technology',
      notes: 'High-value SaaS client.',
    },
  })

  await prisma.report.create({
    data: {
      clientId: client.id,
      periodStart: new Date('2023-10-01'),
      periodEnd: new Date('2023-10-31'),
      status: ReportStatus.success,
      generatedAt: new Date(),
      webViewSlug: generateSlug(),
      summaryJson: {
        metrics: {
          spend: 12000,
          clicks: 48000,
          impressions: 1200000,
          conversions: 520,
          cpc: 0.25,
          cpa: 23.08,
          roas: 5.4,
        },
        channels: [
          {
            channel: 'Google Ads',
            spend: 8000,
            clicks: 32000,
            impressions: 800000,
            conversions: 360,
            cpc: 0.25,
            cpa: 22.22,
            roas: 5.8,
          },
          {
            channel: 'Facebook Ads',
            spend: 4000,
            clicks: 16000,
            impressions: 400000,
            conversions: 160,
            cpc: 0.25,
            cpa: 25,
            roas: 4.8,
          },
        ],
        commentary: 'Strong performance across channels with efficient CPC and stable ROAS.',
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
