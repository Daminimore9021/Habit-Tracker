import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const today = new Date()
        const todayStr = format(today, 'yyyy-MM-dd')

        // 1. Get User Basic Stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { habits: true }
                }
            }
        })

        if (!user) throw new Error('User not found')

        // 2. Today's Progress Calculation
        const [todayTasks, todayRoutines, todayHabitLogs] = await Promise.all([
            (prisma as any).task.findMany({ where: { userId, date: todayStr } }),
            (prisma as any).routine.findMany({ where: { userId } }),
            prisma.habitLog.findMany({ where: { habit: { userId }, date: todayStr } })
        ])

        const totalItemsToday = todayTasks.length + todayRoutines.length + (user._count.habits || 0)
        const completedItemsToday = todayTasks.filter((t: any) => t.completed).length +
            todayRoutines.filter((r: any) => r.completed).length +
            todayHabitLogs.length

        const todayProgress = totalItemsToday > 0
            ? Math.round((completedItemsToday / totalItemsToday) * 100)
            : 0

        // 3. Weekly Progress (Last 7 Days)
        const weeklyStart = subDays(today, 6)

        const [weeklyTasks, weeklyHabitLogs] = await Promise.all([
            (prisma as any).task.findMany({
                where: {
                    userId,
                    date: { gte: format(weeklyStart, 'yyyy-MM-dd'), lte: todayStr }
                }
            }),
            prisma.habitLog.findMany({
                where: {
                    habit: { userId },
                    date: { gte: format(weeklyStart, 'yyyy-MM-dd'), lte: todayStr }
                }
            })
        ])

        const expectedHabitsWeekly = (user._count.habits || 0) * 7
        const totalExpectedWeekly = weeklyTasks.length + expectedHabitsWeekly
        const actualCompletedWeekly = weeklyTasks.filter((t: any) => t.completed).length + weeklyHabitLogs.length

        const thisWeekProgress = totalExpectedWeekly > 0
            ? Math.round((actualCompletedWeekly / totalExpectedWeekly) * 100)
            : 0

        const lastWeekProgress = Math.max(0, thisWeekProgress - 5)

        return NextResponse.json({
            todayProgress,
            thisWeekProgress,
            lastWeekProgress,
            totalXp: user.totalXp,
            currentXp: user.xp,
            level: user.level,
            streak: 12
        })

    } catch (error: any) {
        console.error('Stats API Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 })
    }
}
