'use client'

import { useState, useEffect } from 'react'

export default function NotesSection() {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('extraNotes')
    if (saved) {
      setNotes(saved)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    localStorage.setItem('extraNotes', newNotes)
  }

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/50">
      <h2 className="text-3xl font-bold gradient-text mb-6">Extra Rules / Notes</h2>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Add your reminders, rules, or notes here..."
        className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all shadow-sm"
        rows={6}
      />
      <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
        <span>💡</span>
        <span>This area is for your personal reminders. Everything is saved automatically.</span>
      </p>
    </div>
  )
}
