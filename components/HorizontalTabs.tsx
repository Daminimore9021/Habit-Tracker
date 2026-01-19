'use client'

interface HorizontalTabsProps {
  activeTab: 'routine' | 'task' | 'habit'
  setActiveTab: (tab: 'routine' | 'task' | 'habit') => void
}

export default function HorizontalTabs({ activeTab, setActiveTab }: HorizontalTabsProps) {
  const tabs = [
    { id: 'routine' as const, label: 'Add Routine', icon: '📅', gradient: 'from-purple-500 to-pink-500' },
    { id: 'task' as const, label: 'Add Task', icon: '✅', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'habit' as const, label: 'Add Habit', icon: '🎯', gradient: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="glass-card rounded-2xl p-2 border border-white/50">
      <div className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 transform`
                : 'text-gray-600 hover:bg-gray-100 hover:scale-102 bg-white'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
