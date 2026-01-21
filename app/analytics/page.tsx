'use client'

import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard'
import Navigation from '@/components/Navigation'

export default function AnalyticsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="py-8">
                <AnalyticsDashboard />
            </div>
        </main>
    )
}
