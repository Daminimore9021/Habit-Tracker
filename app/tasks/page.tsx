'use client'

import { useEffect } from 'react'
import TasksTab from '@/components/tabs/TasksTab'

export default function TasksPage() {
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth !== 'true') {
      window.location.href = '/login'
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h2>
        <p className="text-gray-600">Manage your tasks and to-dos</p>
      </div>
      <div className="bg-white rounded-lg border-2 border-[#2563eb] shadow-sm p-6">
        <TasksTab />
      </div>
    </div>
  )
}


