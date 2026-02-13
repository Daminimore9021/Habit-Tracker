
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const username = 'damini9021'
    const user = await prisma.user.findUnique({ where: { username } })

    if (user) {
        await prisma.user.delete({ where: { username } })
        console.log(`User ${username} deleted successfully.`)
    } else {
        console.log(`User ${username} not found.`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
