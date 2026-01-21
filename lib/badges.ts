
import { PrismaClient } from '@prisma/client'

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    category: 'streak' | 'volume' | 'special'
    color: string
}

export const BADGES: Badge[] = [
    {
        id: 'streak_3',
        name: 'Consistency Starter',
        description: 'Maintain a 3-day streak',
        icon: '🌱',
        category: 'streak',
        color: 'from-green-400 to-emerald-600'
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'streak',
        color: 'from-orange-400 to-red-600'
    },
    {
        id: 'streak_30',
        name: 'Habit Master',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        category: 'streak',
        color: 'from-purple-400 to-indigo-600'
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a habit before 8 AM',
        icon: '🌅',
        category: 'special',
        color: 'from-yellow-300 to-amber-500'
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a habit after 10 PM',
        icon: '🦉',
        category: 'special',
        color: 'from-indigo-400 to-slate-900'
    },
    {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first habit ever',
        icon: '🦶',
        category: 'volume',
        color: 'from-blue-400 to-cyan-500'
    },
    {
        id: 'habits_100',
        name: 'Centurion',
        description: 'Complete 100 total habits',
        icon: '💯',
        category: 'volume',
        color: 'from-red-500 to-pink-600'
    }
]

export const checkBadges = async (prisma: PrismaClient, userId: string): Promise<string[]> => {
    const newBadges: string[] = []

    // Fetch user detailed stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            badges: true,
            habits: {
                include: {
                    logs: true
                }
            }
        } as any
    })

    if (!user) return []

    const stringUser = user as any;
    const earnedBadgeIds = new Set(stringUser.badges.map((b: any) => b.badgeId))

    // Helper to award badge
    const award = async (badgeId: string) => {
        if (!earnedBadgeIds.has(badgeId)) {
            await (prisma as any).userBadge.create({
                data: { userId, badgeId }
            })
            newBadges.push(badgeId)
        }
    }

    // --- 1. Volume Checks ---
    const totalHabitsCompleted = stringUser.habits.reduce((acc: number, h: any) => acc + h.logs.length, 0)

    if (totalHabitsCompleted >= 1) await award('first_step')
    if (totalHabitsCompleted >= 100) await award('habits_100')

    // --- 2. Streak Checks ---
    // Calculate max current streak across all habits or simple global streak
    // For simplicity, we check if ANY habit has the streak
    const maxStreak = Math.max(...stringUser.habits.map((h: any) => h.streak), 0)

    if (maxStreak >= 3) await award('streak_3')
    if (maxStreak >= 7) await award('streak_7')
    if (maxStreak >= 30) await award('streak_30')

    // --- 3. Time Checks (Needs log context, hard to do in batch without specific action context usually) ---
    // We can do this check when the user actually performs an action, not in a generic bulk check.
    // For now, checks 'Early Bird' based on valid logs existence if we had time data in logs (Log table only has date)
    // IMPORTANT: HabitLog schema only has 'date' string (YYYY-MM-DD), not time. 
    // START/END Time is on Routines. 
    // We will assume this check happens on the specific API call for toggling, passing the current time.

    return newBadges
}
