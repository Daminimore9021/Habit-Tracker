import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
    headers()
    try {
        const { text, from = 'hi' } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        // Using Google Translate's gtx endpoint (Free, Autodetect source, English target)
        // sl=auto makes it detect Hindi, Marathi, Hinglish etc. automatically
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
        )

        const data = await response.json()

        if (data && data[0] && data[0][0] && data[0][0][0]) {
            // Google returns a nested array: [[["Translated", "Source", ...]]]
            return NextResponse.json({
                translatedText: data[0][0][0]
            })
        }

        return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
