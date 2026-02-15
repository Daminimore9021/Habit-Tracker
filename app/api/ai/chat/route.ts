import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/prisma'
import { format, subDays } from 'date-fns'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERAI_API_KEY || '')

export async function POST(request: Request) {
    try {
        const { message, userId, history } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        if (!process.env.GOOGLE_GENERAI_API_KEY) {
            return NextResponse.json({ error: 'AI API Key is missing' }, { status: 500 })
        }

        // 1. Fetch User Stats for Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { habits: true }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch recent activities for context (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7)
        const dateStr = format(new Date(), 'yyyy-MM-dd')

        const [tasks, habitLogs] = await Promise.all([
            (prisma as any).task.findMany({
                where: {
                    userId,
                    date: { gte: format(sevenDaysAgo, 'yyyy-MM-dd') }
                }
            }),
            prisma.habitLog.findMany({
                where: {
                    habit: { userId },
                    date: { gte: format(sevenDaysAgo, 'yyyy-MM-dd') }
                },
                include: { habit: true }
            })
        ])

        // Calculate some quick stats for the AI
        const totalTasks = tasks.length
        const completedTasks = tasks.filter((t: any) => t.completed).length
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        const activeHabits = user._count.habits
        const habitLogsCount = habitLogs.length

        // 2. Prepare System Prompt
        const systemPrompt = `You are FocusFlow AI, a productivity coach for a habit tracker app. 
Your tone is encouraging, professional, and data-driven.
The user's name is ${user.name || 'User'}.
Current Stats:
- Level: ${user.level} (XP: ${user.xp}/${user.level * 100})
- Total XP: ${user.totalXp}
- Active Habits: ${activeHabits}
- Recent Task Completion Rate (Last 7 days): ${taskCompletionRate}% (${completedTasks}/${totalTasks} tasks)
- Recent Habit Check-ins: ${habitLogsCount} in the last 7 days.

[ACTION MODE]
You can help the user by creating tasks or habits directly. 
To perform an action, append exactly one of the following JSON blocks to the end of your message (after the conversational part):

For a new task:
[ACTION:CREATE_TASK:{"title": "Task Name", "description": "Optional description"}]

For a new habit:
[ACTION:CREATE_HABIT:{"title": "Habit Name", "emoji": "🔥", "description": "Optional description"}]

Rules:
1. Always be supportive.
2. If the user asks about performance, use the stats above.
3. Keep responses concise and formatted with markdown.
4. Only use Action blocks if the user explicitly asks to add or schedule something.
5. If a user asks a question unrelated to productivity, answer politely but bring it back to goals.`

        // 3. Initialize Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        // 4. Start Chat
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: "Hello, who are you?" }] },
                { role: 'model', parts: [{ text: "I am your FocusFlow AI coach. I'm here to help you stay productive and reach your goals!" }] },
                { role: 'user', parts: [{ text: `System Context: ${systemPrompt}` }] },
                { role: 'model', parts: [{ text: "Understood. I have access to the user's data and can perform actions to help them stay organized." }] },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            ],
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        let text = response.text()

        // 5. Action Execution Logic
        const actionRegex = /\[ACTION:(CREATE_TASK|CREATE_HABIT):(\{.*?\})\]/
        const match = text.match(actionRegex)

        if (match) {
            const actionType = match[1]
            const actionData = JSON.parse(match[2])

            console.log(`AI triggering action: ${actionType}`, actionData)

            if (actionType === 'CREATE_TASK') {
                await (prisma as any).task.create({
                    data: {
                        title: actionData.title,
                        description: actionData.description || '',
                        userId,
                        date: format(new Date(), 'yyyy-MM-dd'),
                        completed: false
                    }
                })
            } else if (actionType === 'CREATE_HABIT') {
                await prisma.habit.create({
                    data: {
                        title: actionData.title,
                        emoji: actionData.emoji || '🔥',
                        description: actionData.description || '',
                        userId
                    }
                })
            }

            // Remove the action tag from the visible text for the user
            text = text.replace(actionRegex, '').trim()
            if (!text) text = `Done! I've added that ${actionType === 'CREATE_TASK' ? 'task' : 'habit'} for you.`
        }

        return NextResponse.json({ content: text })

    } catch (error: any) {
        console.error('AI Chat Error [FULL]:', error)
        return NextResponse.json({
            error: error.message || 'Failed to get AI response',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
