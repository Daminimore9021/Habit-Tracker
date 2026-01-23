
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import { BADGES, checkBadges } from '@/lib/badges'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 })
        }

        const userBadges = await (prisma as any).userBadge.findMany({
            where: { userId }
        })

        const earnedIds = new Set(userBadges.map((b: any) => b.badgeId))

        const badgesPayload = BADGES.map(badge => ({
            ...badge,
            earned: earnedIds.has(badge.id),
            earnedAt: userBadges.find((b: any) => b.badgeId === badge.id)?.earnedAt || null
        }))

        return NextResponse.json(badgesPayload)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId, actionContext } = await request.json()

        // Run standard checks
        const newBadges = await checkBadges(prisma, userId)

        // Custom Context Checks (e.g. time of day)
        // If we had more detailed logging, we would check here.
        // For now, if actionContext === 'early_completion', we could manually award.

        if (actionContext && typeof actionContext === 'object') {
            const now = new Date()
            const hour = now.getHours()

            // Check Early Bird (< 8 AM)
            if (hour < 8) {
                // We need to manually check/add because generic checkBadges doesn't know "now" time for persistent logs
                const hasBadge = await (prisma as any).userBadge.findUnique({
                    where: { userId_badgeId: { userId, badgeId: 'early_bird' } }
                })
                if (!hasBadge) {
                    await (prisma as any).userBadge.create({ data: { userId, badgeId: 'early_bird' } })
                    newBadges.push('early_bird')
                }
            }

            // Check Night Owl (> 10 PM)
            if (hour >= 22) {
                const hasBadge = await (prisma as any).userBadge.findUnique({
                    where: { userId_badgeId: { userId, badgeId: 'night_owl' } }
                })
                if (!hasBadge) {
                    await (prisma as any).userBadge.create({ data: { userId, badgeId: 'night_owl' } })
                    newBadges.push('night_owl')
                }
            }
        }

        return NextResponse.json({ newBadges })

    } catch (error) {
        console.error("Badge Check Error", error)
        return NextResponse.json({ error: 'Failed to check badges' }, { status: 500 })
    }
}
