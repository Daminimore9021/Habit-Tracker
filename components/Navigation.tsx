'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(auth === 'true')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null
  }

  return (
    <nav className="glass-card border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="text-2xl sm:text-3xl font-bold gradient-text hover:scale-105 transition-transform">
            ✨ Habit Tracker
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-lift"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

