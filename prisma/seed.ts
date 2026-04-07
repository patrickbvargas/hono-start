// TODO: implementar
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
// 	await prisma.employeeType.upsert({
// 		where: { value: "LAWYER" },
// 		update: {},
// 		create: { value: "LAWYER", label: "Advogado" },
// 	});
// 	await prisma.employeeType.upsert({
// 		where: { value: "ADMIN_ASSISTANT" },
// 		update: {},
// 		create: { value: "ADMIN_ASSISTANT", label: "Assistente Administrativo" },
// 	});
// 	await prisma.userRole.upsert({
// 		where: { value: "ADMIN" },
// 		update: {},
// 		create: { value: "ADMIN", label: "Administrador" },
// 	});
// 	await prisma.userRole.upsert({
// 		where: { value: "USER" },
// 		update: {},
// 		create: { value: "USER", label: "Usuário" },
// 	});
// }

// main()
// 	.catch(console.error)
// 	.finally(() => prisma.$disconnect());
