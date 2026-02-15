import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            console.error('RESEND_API_KEY is not defined')
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
        }
        const resend = new Resend(apiKey)
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const user = await (prisma as any).user.findUnique({
            where: { email }
        })

        if (!user) {
            // Return success anyway for security reasons (don't leak which emails exist)
            return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Send email
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetLink = `${origin}/reset-password?token=${resetToken}`

        await resend.emails.send({
            from: 'FocusFlow <onboarding@resend.dev>', // Update this after domain verification
            to: email,
            subject: 'Password Reset - FocusFlow',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Reset Your Password</h2>
                    <p>You requested a password reset for your FocusFlow account. Click the button below to set a new password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        })

        return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' })
    } catch (error: any) {
        console.error('Forgot Password Error:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}
