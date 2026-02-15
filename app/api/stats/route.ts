import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
    headers()
    console.log('--- Stats API hit [Vercel-Fix-Check] ---')
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const userId = authResult.userId!

        const today = new Date()
        const todayStr = format(today, 'yyyy-MM-dd')

        // 2. Fetch last 14 days of data for evolution analysis
        const fourteenDaysAgo = subDays(today, 14)
        const dateRangeFilter = {
            gte: format(fourteenDaysAgo, 'yyyy-MM-dd'),
            lte: todayStr
        }

        const [user, routines, tasks, habitLogs, routineLogs] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                include: {
                    _count: {
                        select: { habits: true }
                    }
                }
            }),
            (prisma as any).routine.findMany({
                where: { userId }
            }),
            prisma.task.findMany({
                where: {
                    userId,
                    date: dateRangeFilter
                }
            }),
            prisma.habitLog.findMany({
                where: {
                    habit: { userId },
                    date: dateRangeFilter
                }
            }),
            (prisma as any).routineLog.findMany({
                where: {
                    routine: { userId },
                    date: dateRangeFilter
                }
            })
        ])

        if (!user) throw new Error('User not found')

        // 3. Process Daily Stats for the last 14 days (optimized)
        // Group tasks and habit logs by date for O(1) lookups in the loop
        const tasksByDate: Record<string, { total: number, completed: number }> = {}
        const habitsByDate: Record<string, number> = {}

        tasks.forEach((t: any) => {
            if (!tasksByDate[t.date]) tasksByDate[t.date] = { total: 0, completed: 0 }
            tasksByDate[t.date].total++
            if (t.completed) tasksByDate[t.date].completed++
        })

        habitLogs.forEach((h: any) => {
            habitsByDate[h.date] = (habitsByDate[h.date] || 0) + 1
        })

        const routinesByDate: Record<string, number> = {}
        routineLogs.forEach((r: any) => {
            routinesByDate[r.date] = (routinesByDate[r.date] || 0) + 1
        })

        const userHabitCount = user._count.habits || 0
        const routineCount = routines.length

        // Note: Routine completion is complex in this schema without logs.
        // We'll treat current routine 'completed' status as today's status.
        const routinesCompletedToday = routines.filter((r: any) => r.completed).length

        let dailyStats: any[] = []
        for (let i = 13; i >= 0; i--) {
            const d = subDays(today, i)
            const dStr = format(d, 'yyyy-MM-dd')
            const dayLabel = format(d, 'MMM dd')

            const taskStats = tasksByDate[dStr] || { total: 0, completed: 0 }
            const habitStats = habitsByDate[dStr] || 0
            const routineLogStats = routinesByDate[dStr] || 0

            // For historical dates, we count completion based on logs
            let total = 0
            let completed = 0

            if (i === 0) {
                // Today: include baseline totals and today's completions
                total = taskStats.total + routineCount + userHabitCount
                completed = taskStats.completed + routinesCompletedToday + habitStats
            } else {
                // Past days: include baseline totals and historical logs
                total = taskStats.total + routineCount + userHabitCount
                completed = taskStats.completed + routineLogStats + habitStats
            }

            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

            dailyStats.push({
                date: dStr,
                label: dayLabel,
                percentage
            })
        }

        // 4. Calculate Aggregates
        // Today
        const todayStat = dailyStats[dailyStats.length - 1]
        const todayProgress = todayStat.percentage

        // Weekly (Last 7 days)
        const last7Days = dailyStats.slice(-7)
        const avg7Days = Math.round(last7Days.reduce((acc, curr) => acc + curr.percentage, 0) / 7)

        // 14-day average (optimized from 30 days)
        const avg14Days = Math.round(dailyStats.reduce((acc, curr) => acc + curr.percentage, 0) / 14)

        // 5. Generate "AI" Insight
        // 5. Advanced Heuristic Analysis
        const dayStats: Record<number, { total: number, completed: number, name: string }> = {
            0: { total: 0, completed: 0, name: 'Sunday' },
            1: { total: 0, completed: 0, name: 'Monday' },
            2: { total: 0, completed: 0, name: 'Tuesday' },
            3: { total: 0, completed: 0, name: 'Wednesday' },
            4: { total: 0, completed: 0, name: 'Thursday' },
            5: { total: 0, completed: 0, name: 'Friday' },
            6: { total: 0, completed: 0, name: 'Saturday' }
        }

        dailyStats.forEach(day => {
            const dateObj = new Date(day.date)
            const dayOfWeek = dateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
            // We use percentage as a proxy for score
            dayStats[dayOfWeek].total += 100
            dayStats[dayOfWeek].completed += day.percentage
        })

        const dayPerformance = Object.entries(dayStats).map(([key, val]) => ({
            name: val.name,
            score: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0
        })).sort((a, b) => b.score - a.score)

        const bestDay = dayPerformance[0]
        const worstDay = dayPerformance[dayPerformance.length - 1]

        // Weekend vs Weekday
        const weekendScore = Math.round((dayStats[0].completed + dayStats[6].completed) / (dayStats[0].total + dayStats[6].total || 1) * 100)

        const weekdayTotal = dayStats[1].total + dayStats[2].total + dayStats[3].total + dayStats[4].total + dayStats[5].total
        const weekdayCompleted = dayStats[1].completed + dayStats[2].completed + dayStats[3].completed + dayStats[4].completed + dayStats[5].completed
        const weekdayScore = Math.round((weekdayCompleted / (weekdayTotal || 1)) * 100)

        // Generate Specific Tips
        const tips: string[] = []

        if (Math.abs(weekendScore - weekdayScore) > 15) {
            if (weekendScore < weekdayScore) {
                tips.push("📉 Weekend Slump Detected: Your habits drop significantly on weekends. Try setting a specific 'Weekend Routine' that is lighter but keeps the streak alive.")
            } else {
                tips.push("🔥 Weekend Warrior: You do great on weekends! Try to bring some of that free-time energy into your Monday routine.")
            }
        }

        if (worstDay.score < 60) {
            tips.push(`🗓️ Struggle Day: ${worstDay.name} seems to be your toughest day (${worstDay.score}%). Plan your easiest tasks for ${worstDay.name}s to ensure a win.`)
        }

        if (bestDay.score > 90) {
            tips.push(`🚀 Power Day: You absolutely crush it on ${bestDay.name}s (${bestDay.score}%). Schedule your hardest work then!`)
        }

        if (avg7Days > avg14Days + 10) {
            tips.push("📈 Trending Up: Your recent week is much better than your 14-day average. Whatever change you made is working!")
        }

        // Fallback tip
        if (tips.length === 0) {
            tips.push("🤖 Steady State: Your performance is very consistent. Challenge yourself by adding one small new habit.")
        }

        // Limit to 3 tips
        const insights = tips.slice(0, 3)

        // Main AI Insight
        let aiInsight = ""

        // Calculate previous week average for comparison
        const previousWeek = dailyStats.slice(-14, -7)
        const prevWeekAvg = Math.round(previousWeek.reduce((acc, curr) => acc + curr.percentage, 0) / 7)

        const improvement = avg7Days - prevWeekAvg

        if (avg7Days >= 80) {
            aiInsight = "🌟 Elite Consistency. You are performing in the top tier of habit builders."
        } else if (improvement > 10) {
            aiInsight = "📈 Significant Growth. You've turned a corner this week!"
        } else if (improvement < -10) {
            aiInsight = "📉 Needs Attention. Let's get you back on track before the streak cools off."
        } else {
            aiInsight = "⚖️ Balanced workflow. You are maintaining a healthy routine."
        }

        return NextResponse.json({
            todayProgress,
            thisWeekProgress: avg7Days,
            lastWeekProgress: prevWeekAvg,
            monthlyProgress: avg14Days,
            totalXp: user.totalXp,
            currentXp: user.xp,
            level: user.level,
            streak: 12,
            history: dailyStats,
            insight: aiInsight,
            tips: insights,
            bestDay: bestDay.name,
            worstDay: worstDay.name
        })

    } catch (error: any) {
        console.error('Stats API Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 })
    }
}
