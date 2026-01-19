const DEFAULT_USER_ID = "user_default_id"

async function seedData() {
    const habits = [
        { title: "English speaking", emoji: "🗣️" },
        { title: "AI Learning", emoji: "🤖" },
        { title: "Exercise/Walk", emoji: "🏃" },
        { title: "Read Book", emoji: "📖" },
        { title: "Phone Limit", emoji: "📱" },
        { title: "Clean Eating (Sugar Holiday)", emoji: "🥦" }
    ]

    const routines = [
        { title: "Freshen up", time: "5:00 - 5:15" },
        { title: "AI Learning", time: "5:15 - 6:00" },
        { title: "Kitchen work", time: "6:00 - 7:00" },
        { title: "Exercise", time: "7:00 - 8:00" },
        { title: "Freshen up & Breakfast", time: "8:00 - 9:00" },
        { title: "English Practice", time: "9:00 - 10:00" },
        { title: "Office Work", time: "10:00 - 7:30" },
        { title: "Walk", time: "7:30 - 8:30" },
        { title: "Dinner & Freelancing", time: "8:30 - 11:00" },
        { title: "Tomorrow's plan & Journaling", time: "11:00 - 11:30" },
        { title: "Sleep", time: "11:30 - 5:00" }
    ]

    const tasks = [
        { title: "Uninstall Instagram during office hours", date: new Date().toISOString().split('T')[0] },
        { title: "Practice English by myself", date: new Date().toISOString().split('T')[0] }
    ]

    console.log("Seeding habits...")
    for (const h of habits) {
        await fetch('http://localhost:3000/api/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(h)
        })
    }

    console.log("Seeding routines...")
    for (const r of routines) {
        await fetch('http://localhost:3000/api/routines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r)
        })
    }

    console.log("Seeding tasks...")
    for (const t of tasks) {
        await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
        })
    }

    console.log("Seeding complete!")
}

seedData().catch(console.error)
