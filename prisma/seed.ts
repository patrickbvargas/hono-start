import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const DEFAULT_FIRM_ID = 1;

interface EmployeeSeedInput {
  fullName: string;
  email: string;
  typeValue: "LAWYER" | "ADMIN_ASSISTANT";
  roleValue: "ADMIN" | "USER";
  remunerationPercentage: string;
  referralPercentage: string;
  isActive: boolean;
  oabNumber?: string;
}

interface ClientSeedInput {
  fullName: string;
  document: string;
  typeValue: "INDIVIDUAL" | "COMPANY";
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

function padNumeric(value: number, size: number) {
  return value.toString().padStart(size, "0");
}

function calculateCpfDigit(baseDigits: string) {
  const weightStart = baseDigits.length + 1;
  const sum = baseDigits.split("").reduce((total, digit, index) => {
    return total + Number(digit) * (weightStart - index);
  }, 0);

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

function createCpf(seed: number) {
  const base = padNumeric(seed, 9);
  const firstDigit = calculateCpfDigit(base);
  const secondDigit = calculateCpfDigit(`${base}${firstDigit}`);

  return `${base}${firstDigit}${secondDigit}`;
}

function calculateCnpjDigit(baseDigits: string) {
  const factors =
    baseDigits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const sum = baseDigits.split("").reduce((total, digit, index) => {
    return total + Number(digit) * (factors[index] ?? 0);
  }, 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function createCnpj(seed: number) {
  const root = `10${padNumeric(seed, 6)}0001`;
  const firstDigit = calculateCnpjDigit(root);
  const secondDigit = calculateCnpjDigit(`${root}${firstDigit}`);

  return `${root}${firstDigit}${secondDigit}`;
}

function createOabNumber(seed: number) {
  const states = ["RS", "SP", "RJ", "MG", "SC", "PR"];
  return `${states[seed % states.length]}${padNumeric(seed, 6)}`;
}

function createPhone(seed: number) {
  return `1198${padNumeric(seed, 7)}`;
}

function createEmployeeSeeds(): EmployeeSeedInput[] {
  const lawyerNames = [
    "Amanda Admin",
    "Bruna Farias",
    "Carlos Mendes",
    "Daniela Rocha",
    "Eduardo Lima",
    "Fernanda Costa",
    "Gustavo Nunes",
    "Helena Duarte",
    "Igor Almeida",
    "Juliana Freitas",
    "Kaio Martins",
    "Larissa Teixeira",
  ];

  const assistantNames = [
    "Marina Soares",
    "Nicolas Batista",
    "Olivia Ramos",
    "Paulo Henrique",
    "Queila Borges",
    "Renata Cardoso",
    "Samuel Vieira",
    "Talita Goncalves",
  ];

  const lawyers = lawyerNames.map((fullName, index) => ({
    fullName,
    email:
      index === 0
        ? "amanda.admin@matriz.test"
        : `${fullName.toLowerCase().replaceAll(" ", ".")}@matriz.test`,
    typeValue: "LAWYER" as const,
    roleValue: index < 2 ? ("ADMIN" as const) : ("USER" as const),
    remunerationPercentage: index < 4 ? "0.3500" : "0.3000",
    referralPercentage: index < 6 ? "0.1000" : "0.0500",
    isActive: index !== 10,
    oabNumber: createOabNumber(index + 1),
  }));

  const assistants = assistantNames.map((fullName, index) => ({
    fullName,
    email: `${fullName.toLowerCase().replaceAll(" ", ".")}@matriz.test`,
    typeValue: "ADMIN_ASSISTANT" as const,
    roleValue: "USER" as const,
    remunerationPercentage: index < 4 ? "0.1200" : "0.1500",
    referralPercentage: "0.0000",
    isActive: index !== 6,
  }));

  return [...lawyers, ...assistants];
}

function createClientSeeds(): ClientSeedInput[] {
  const individualNames = [
    "Ana Beatriz Souza",
    "Bruno Henrique Melo",
    "Camila Oliveira Santos",
    "Diego Pereira Lima",
    "Elisa Martins Araujo",
    "Felipe Rocha Gomes",
    "Gabriela Fernandes Alves",
    "Henrique Silva Costa",
    "Isabela Cardoso Ribeiro",
    "Joao Victor Nascimento",
    "Karen Duarte Vieira",
    "Leonardo Freitas Moura",
  ];

  const companyNames = [
    "Alfa Consultoria Ltda",
    "Beta Servicos Medicos Ltda",
    "Celta Engenharia Ltda",
    "Delta Logistica Ltda",
    "Estrela Comercio Ltda",
    "Foco Tecnologia Ltda",
    "Global Educacao Ltda",
    "Horizonte Imoveis Ltda",
  ];

  const individuals = individualNames.map((fullName, index) => ({
    fullName,
    document: createCpf(index + 1),
    typeValue: "INDIVIDUAL" as const,
    email: `cliente${index + 1}@matriz.test`,
    phone: createPhone(index + 1),
    isActive: index !== 10,
  }));

  const companies = companyNames.map((fullName, index) => ({
    fullName,
    document: createCnpj(index + 1),
    typeValue: "COMPANY" as const,
    email: `contato${index + 1}@empresa.matriz.test`,
    phone: createPhone(index + 21),
    isActive: index !== 6,
  }));

  return [...individuals, ...companies];
}

async function main() {
  console.log("🌱 Seeding database...");

  await Promise.all(
    [
      {
        value: "LAWYER",
        label: "Advogado",
      },
      {
        value: "ADMIN_ASSISTANT",
        label: "Assistente Administrativo",
      },
    ].map((item) =>
      prisma.employeeType.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "ADMIN", label: "Administrador" },
      { value: "USER", label: "Usuário" },
    ].map((item) =>
      prisma.userRole.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "INDIVIDUAL", label: "Pessoa Física" },
      { value: "COMPANY", label: "Pessoa Jurídica" },
    ].map((item) =>
      prisma.clientType.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "SOCIAL_SECURITY", label: "Previdenciário" },
      { value: "CIVIL", label: "Cível" },
      { value: "FAMILY", label: "Família" },
      { value: "LABOR", label: "Trabalhista" },
      { value: "OTHER", label: "Outros" },
    ].map((item) =>
      prisma.legalArea.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "ACTIVE", label: "Ativo" },
      { value: "COMPLETED", label: "Concluído" },
      { value: "CANCELLED", label: "Cancelado" },
    ].map((item) =>
      prisma.contractStatus.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "RESPONSIBLE", label: "Responsável" },
      { value: "RECOMMENDING", label: "Indicante" },
      { value: "RECOMMENDED", label: "Indicado" },
      { value: "ADMIN_ASSISTANT", label: "Assistente Administrativo" },
    ].map((item) =>
      prisma.assignmentType.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await Promise.all(
    [
      { value: "ADMINISTRATIVE", label: "Administrativo" },
      { value: "JUDICIAL", label: "Judicial" },
      { value: "SUCCUMBENCY", label: "Sucumbência" },
    ].map((item) =>
      prisma.revenueType.upsert({
        where: { value: item.value },
        update: { label: item.label, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );

  await prisma.firm.upsert({
    where: { id: DEFAULT_FIRM_ID },
    update: {},
    create: { id: DEFAULT_FIRM_ID, name: "Matriz" },
  });

  const [
    lawyerType,
    assistantType,
    adminRole,
    userRole,
    individualType,
    companyType,
  ] = await Promise.all([
    prisma.employeeType.findUniqueOrThrow({ where: { value: "LAWYER" } }),
    prisma.employeeType.findUniqueOrThrow({
      where: { value: "ADMIN_ASSISTANT" },
    }),
    prisma.userRole.findUniqueOrThrow({ where: { value: "ADMIN" } }),
    prisma.userRole.findUniqueOrThrow({ where: { value: "USER" } }),
    prisma.clientType.findUniqueOrThrow({ where: { value: "INDIVIDUAL" } }),
    prisma.clientType.findUniqueOrThrow({ where: { value: "COMPANY" } }),
  ]);

  await Promise.all(
    createEmployeeSeeds().map((employee) =>
      prisma.employee.upsert({
        where: { email: employee.email },
        update: {
          firmId: DEFAULT_FIRM_ID,
          fullName: employee.fullName,
          typeId:
            employee.typeValue === "LAWYER" ? lawyerType.id : assistantType.id,
          roleId: employee.roleValue === "ADMIN" ? adminRole.id : userRole.id,
          oabNumber: employee.oabNumber ?? null,
          remunerationPercentage: employee.remunerationPercentage,
          referralPercentage: employee.referralPercentage,
          avatarUrl: null,
          isActive: employee.isActive,
          deletedAt: null,
        },
        create: {
          firmId: DEFAULT_FIRM_ID,
          fullName: employee.fullName,
          email: employee.email,
          typeId:
            employee.typeValue === "LAWYER" ? lawyerType.id : assistantType.id,
          roleId: employee.roleValue === "ADMIN" ? adminRole.id : userRole.id,
          oabNumber: employee.oabNumber ?? null,
          remunerationPercentage: employee.remunerationPercentage,
          referralPercentage: employee.referralPercentage,
          avatarUrl: null,
          isActive: employee.isActive,
        },
      }),
    ),
  );

  await Promise.all(
    createClientSeeds().map((client) =>
      prisma.client.upsert({
        where: {
          firmId_document: {
            firmId: DEFAULT_FIRM_ID,
            document: client.document,
          },
        },
        update: {
          firmId: DEFAULT_FIRM_ID,
          typeId:
            client.typeValue === "INDIVIDUAL"
              ? individualType.id
              : companyType.id,
          fullName: client.fullName,
          email: client.email,
          phone: client.phone,
          isActive: client.isActive,
          deletedAt: null,
        },
        create: {
          firmId: DEFAULT_FIRM_ID,
          typeId:
            client.typeValue === "INDIVIDUAL"
              ? individualType.id
              : companyType.id,
          fullName: client.fullName,
          document: client.document,
          email: client.email,
          phone: client.phone,
          isActive: client.isActive,
        },
      }),
    ),
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
