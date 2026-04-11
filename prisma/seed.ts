import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.employeeType.upsert({
    where: { value: "LAWYER" },
    update: { isActive: true },
    create: { value: "LAWYER", label: "Advogado", isActive: true },
  });
  await prisma.employeeType.upsert({
    where: { value: "ADMIN_ASSISTANT" },
    update: { isActive: true },
    create: {
      value: "ADMIN_ASSISTANT",
      label: "Assistente Administrativo",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { value: "ADMIN" },
    update: { isActive: true },
    create: { value: "ADMIN", label: "Administrador", isActive: true },
  });
  await prisma.userRole.upsert({
    where: { value: "USER" },
    update: { isActive: true },
    create: { value: "USER", label: "Usuário", isActive: true },
  });

  await prisma.firm.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Matriz" },
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
