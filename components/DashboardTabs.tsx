'use client'

import { useState } from 'react'
import DailyRoutineTab from './tabs/DailyRoutineTab'
import TasksTab from './tabs/TasksTab'
import HabitsTab from './tabs/HabitsTab'
import DailyTab from './tabs/DailyTab'

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('routine')

  const tabs = [
    { id: 'routine', name: 'Daily Routine', icon: '📅' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'habits', name: 'Habits', icon: '🎯' },
    { id: 'daily', name: 'Daily', icon: '📊' },
  ]

  return (
    <div className="bg-white rounded-lg border-2 border-[#2563eb] shadow-sm">
      <div className="border-b-2 border-[#2563eb]">
        <div className="flex space-x-1 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#2563eb]'
                  : 'text-gray-600 hover:text-[#2563eb]'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'routine' && <DailyRoutineTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'daily' && <DailyTab />}
      </div>
    </div>
  )
}


