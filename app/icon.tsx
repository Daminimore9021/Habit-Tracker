import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 20,
                    background: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)', // blue-500 to violet-500
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 800,
                }}
            >
                HQ
            </div>
        ),
        {
            ...size,
        }
    )
}
