'use client'

import { useState, useEffect } from 'react'
import AnimatedDashboard from '@/components/AnimatedDashboard'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Keep auth check simple for now, can be replaced with Supabase Auth later
    const auth = localStorage.getItem('isAuthenticated')
    if (auth !== 'true') {
      window.location.href = '/login'
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return null
  }

  return <AnimatedDashboard />
}
