import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
    const adminPassword = await bcrypt.hash("admin123", 10)
    const userPassword = await bcrypt.hash("user123", 10)

    await prisma.user.upsert({
        where: { email: "admin@gmail.com" },
        update: {},
        create: { name: "Admin", email: "admin@gmail.com", password: adminPassword, role: "ADMIN" }
    })

    await prisma.user.upsert({
        where: { email: "user@gmail.com" },
        update: {},
        create: { name: "User", email: "user@gmail.com", password: userPassword, role: "USER" }
    })

    console.log("Seed selesai:");
    console.log("Admin -> admin@gmail.com / admin123");
    console.log("User -> user@gmail.com / user123");
}

main()
.catch((e) => {
    console.error(e)
    process.exit(1)
})
.finally(() => prisma.$disconnect())