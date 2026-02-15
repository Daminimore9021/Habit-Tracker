import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from './supabase'

/**
 * Helper function to get authenticated user from Supabase session
 * Use this in API routes to validate authentication and get userId
 */
export async function getAuthenticatedUser(request: NextRequest) {
    const supabase = createServerClient()

    // Get session from cookies
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        return {
            user: null,
            error: 'Unauthorized',
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        }
    }

    return {
        user,
        userId: user.id,
        error: null,
        response: null,
    }
}

/**
 * Alternative: Get userId from request body (for backward compatibility during migration)
 * This allows gradual migration of API routes
 */
export async function getUserIdFromRequest(request: NextRequest) {
    // First try to get from Supabase session
    const authResult = await getAuthenticatedUser(request)

    if (authResult.user) {
        return authResult.userId
    }

    // Fallback: try to get from request body (old method)
    try {
        const body = await request.json()
        return body.userId || null
    } catch {
        return null
    }
}
