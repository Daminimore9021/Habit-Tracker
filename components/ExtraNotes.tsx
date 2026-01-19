'use client'

import { useState, useEffect } from 'react'

export default function ExtraNotes() {
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
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">
        Extra Rules / Notes
      </h2>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Add your reminders, rules, or notes here..."
        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
        rows={6}
      />
      <p className="mt-2 text-xs text-gray-500">
        This area is for your personal reminders and rules. Everything is saved automatically.
      </p>
    </section>
  )
}


