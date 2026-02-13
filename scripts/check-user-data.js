
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const username = process.argv[2]
    if (!username) {
        console.log('Provide username')
        return
    }
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            habits: true,
            tasks: true,
            routines: true
        }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('--- User Data ---')
    console.log(`Username: ${user.username}`)
    console.log(`Habits: ${user.habits.length}`)
    console.log(`Tasks: ${user.tasks.length}`)
    console.log(`Routines: ${user.routines.length}`)

    if (user.habits.length === 0 && user.tasks.length === 0 && user.routines.length === 0) {
        console.log('User has no data. Safe to delete.')
    } else {
        console.log('User HAS data. Better to reset password.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
