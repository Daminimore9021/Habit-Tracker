import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/prisma'
import { subDays, format } from 'date-fns'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERAI_API_KEY || '')

export async function POST(request: Request) {
    headers()
    try {
        const { message, userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // 1. Fetch Context (Recent Stats, Habits, Moods)
        const [user, habits, tasks, moods] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.habit.findMany({ where: { userId }, include: { logs: true } }),
            prisma.task.findMany({ where: { userId, createdAt: { gte: subDays(new Date(), 7) } } }),
            prisma.moodLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 7 })
        ])

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const context = {
            userName: user.name,
            level: user.level,
            xp: user.xp,
            habits: habits.map(h => ({ title: h.title, streak: h.streak })),
            recentTasks: tasks.map(t => ({ title: t.title, completed: t.completed })),
            recentMoods: moods.map(m => m.moodType)
        }

        // 2. Initialize Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
        You are "FocusFlow AI", a premium productivity assistant. 
        You have access to the user's dashboard data.
        
        USER CONTEXT:
        - Name: ${context.userName}
        - Level: ${context.level} (XP: ${context.xp})
        - Habits: ${JSON.stringify(context.habits)}
        - Last 7 Days Tasks: ${JSON.stringify(context.recentTasks)}
        - Recent Moods: ${JSON.stringify(context.recentMoods)}
        
        GOAL:
        - Be encouraging, empathetic, and data-driven.
        - If they ask about "last week" or "pending tasks", look at the context provided.
        - If they share feelings, be supportive and suggest a productivity win.
        - Keep responses concise (max 3-4 sentences).
        
        USER MESSAGE: "${message}"
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ response: text })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 })
    }
}
