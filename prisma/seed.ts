import { Prisma, PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const DEFAULT_FIRM_ID = 1;
const MINIMUM_CONTRACT_COUNT = 20;

type EmployeeTypeValue = "LAWYER" | "ADMIN_ASSISTANT";
type UserRoleValue = "ADMIN" | "USER";
type ClientTypeValue = "INDIVIDUAL" | "COMPANY";
type LegalAreaValue =
  | "SOCIAL_SECURITY"
  | "CIVIL"
  | "FAMILY"
  | "LABOR"
  | "OTHER";
type ContractStatusValue = "ACTIVE" | "COMPLETED" | "CANCELLED";
type AssignmentTypeValue =
  | "RESPONSIBLE"
  | "RECOMMENDING"
  | "RECOMMENDED"
  | "ADMIN_ASSISTANT";
type RevenueTypeValue = "ADMINISTRATIVE" | "JUDICIAL" | "SUCCUMBENCY";
type AttachmentTypeValue = "PDF" | "JPG" | "PNG";

interface EmployeeSeedInput {
  fullName: string;
  email: string;
  typeValue: EmployeeTypeValue;
  roleValue: UserRoleValue;
  remunerationPercentage: string;
  referralPercentage: string;
  isActive: boolean;
  oabNumber?: string;
}

interface ClientSeedInput {
  fullName: string;
  document: string;
  typeValue: ClientTypeValue;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

interface ContractAssignmentSeedInput {
  employeeEmail: string;
  assignmentTypeValue: AssignmentTypeValue;
  isActive?: boolean;
}

interface FeeSeedInput {
  amount: string;
  installmentNumber: number;
  paymentDate: string;
  generatesRemuneration: boolean;
  isActive: boolean;
}

interface RevenueSeedInput {
  typeValue: RevenueTypeValue;
  totalValue: string;
  downPaymentValue: string | null;
  paymentStartDate: string;
  totalInstallments: number;
  isActive: boolean;
  fees: FeeSeedInput[];
}

interface ContractSeedInput {
  processNumber: string;
  clientDocument: string;
  legalAreaValue: LegalAreaValue;
  statusValue: ContractStatusValue;
  feePercentage: string;
  notes: string;
  allowStatusChange: boolean;
  isActive: boolean;
  assignments: ContractAssignmentSeedInput[];
  revenues: RevenueSeedInput[];
}

interface EmployeeRecord {
  id: number;
  email: string;
  remunerationPercentage: Prisma.Decimal;
  referralPercentage: Prisma.Decimal;
}

interface ClientRecord {
  id: number;
  document: string;
}

interface LookupRecord<TValue extends string> {
  id: number;
  value: TValue;
}

interface CreatedContractAssignment {
  id: number;
  assignmentTypeValue: AssignmentTypeValue;
  employee: {
    remunerationPercentage: Prisma.Decimal;
    referralPercentage: Prisma.Decimal;
  };
}

function padNumeric(value: number, size: number) {
  return value.toString().padStart(size, "0");
}

function decimal(value: Prisma.Decimal | string | number) {
  return new Prisma.Decimal(value);
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

function getRotatedValue<T>(items: T[], index: number, offset = 0) {
  const item = items[(index + offset) % items.length];

  if (item === undefined) {
    throw new Error("Fixture rotation attempted to read an empty collection");
  }

  return item;
}

function createContractProcessNumber(index: number) {
  return `PROC-SEED-2026-${padNumeric(index + 1, 4)}`;
}

function createContractSeeds(
  clients: ClientSeedInput[],
  employees: EmployeeSeedInput[],
): ContractSeedInput[] {
  const activeLawyerEmails = employees
    .filter((employee) => employee.typeValue === "LAWYER" && employee.isActive)
    .map((employee) => employee.email);
  const activeAssistantEmails = employees
    .filter(
      (employee) =>
        employee.typeValue === "ADMIN_ASSISTANT" && employee.isActive,
    )
    .map((employee) => employee.email);

  if (clients.length < MINIMUM_CONTRACT_COUNT) {
    throw new Error(
      `Expected at least ${MINIMUM_CONTRACT_COUNT} seeded clients, received ${clients.length}`,
    );
  }

  if (activeLawyerEmails.length < 3 || activeAssistantEmails.length < 1) {
    throw new Error("Seed fixtures require active lawyers and assistants");
  }

  const legalAreas: LegalAreaValue[] = [
    "SOCIAL_SECURITY",
    "CIVIL",
    "FAMILY",
    "LABOR",
    "OTHER",
  ];

  return clients.slice(0, MINIMUM_CONTRACT_COUNT).map((client, index) => {
    const scenarioIndex = index % 6;
    const responsibleEmail = getRotatedValue(activeLawyerEmails, index);
    const recommendingEmail = getRotatedValue(activeLawyerEmails, index, 1);
    const recommendedEmail = getRotatedValue(activeLawyerEmails, index, 2);
    const assistantEmail = getRotatedValue(activeAssistantEmails, index);
    const legalAreaValue = getRotatedValue(legalAreas, index);
    const processNumber = createContractProcessNumber(index);

    switch (scenarioIndex) {
      case 0:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "ACTIVE",
          feePercentage: "0.3000",
          notes:
            "Contrato seed padrao com advogado responsavel e pagamento parcial.",
          allowStatusChange: true,
          isActive: true,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
          ],
          revenues: [
            {
              typeValue: "ADMINISTRATIVE",
              totalValue: "15000.00",
              downPaymentValue: "3000.00",
              paymentStartDate: "2026-01-10T00:00:00.000Z",
              totalInstallments: 4,
              isActive: true,
              fees: [
                {
                  amount: "2000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-10T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "2000.00",
                  installmentNumber: 2,
                  paymentDate: "2026-03-10T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
          ],
        };
      case 1:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "ACTIVE",
          feePercentage: "0.3000",
          notes:
            "Contrato seed com assistente administrativo e honorarios ativos.",
          allowStatusChange: true,
          isActive: index % 12 !== 1,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
            {
              employeeEmail: assistantEmail,
              assignmentTypeValue: "ADMIN_ASSISTANT",
            },
          ],
          revenues: [
            {
              typeValue: "JUDICIAL",
              totalValue: "18000.00",
              downPaymentValue: "2000.00",
              paymentStartDate: "2026-01-15T00:00:00.000Z",
              totalInstallments: 4,
              isActive: true,
              fees: [
                {
                  amount: "4000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-15T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "4000.00",
                  installmentNumber: 2,
                  paymentDate: "2026-03-15T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
          ],
        };
      case 2:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "ACTIVE",
          feePercentage: "0.3500",
          notes:
            "Contrato seed de indicacao com responsavel, indicante e indicado.",
          allowStatusChange: true,
          isActive: true,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
            {
              employeeEmail: recommendingEmail,
              assignmentTypeValue: "RECOMMENDING",
            },
            {
              employeeEmail: recommendedEmail,
              assignmentTypeValue: "RECOMMENDED",
            },
          ],
          revenues: [
            {
              typeValue: "ADMINISTRATIVE",
              totalValue: "22000.00",
              downPaymentValue: "5000.00",
              paymentStartDate: "2026-01-20T00:00:00.000Z",
              totalInstallments: 4,
              isActive: true,
              fees: [
                {
                  amount: "4000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-20T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
          ],
        };
      case 3:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "ACTIVE",
          feePercentage: "0.2500",
          notes: "Contrato seed com honorario sem geracao de remuneracao.",
          allowStatusChange: true,
          isActive: true,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
            {
              employeeEmail: assistantEmail,
              assignmentTypeValue: "ADMIN_ASSISTANT",
            },
          ],
          revenues: [
            {
              typeValue: "SUCCUMBENCY",
              totalValue: "12000.00",
              downPaymentValue: "1000.00",
              paymentStartDate: "2026-01-05T00:00:00.000Z",
              totalInstallments: 3,
              isActive: true,
              fees: [
                {
                  amount: "2000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-05T00:00:00.000Z",
                  generatesRemuneration: false,
                  isActive: true,
                },
              ],
            },
          ],
        };
      case 4:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "COMPLETED",
          feePercentage: "0.3000",
          notes:
            "Contrato seed quitado para validar fechamento automatico e historico.",
          allowStatusChange: true,
          isActive: true,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
            {
              employeeEmail: assistantEmail,
              assignmentTypeValue: "ADMIN_ASSISTANT",
            },
          ],
          revenues: [
            {
              typeValue: "JUDICIAL",
              totalValue: "14000.00",
              downPaymentValue: "2000.00",
              paymentStartDate: "2026-01-12T00:00:00.000Z",
              totalInstallments: 3,
              isActive: true,
              fees: [
                {
                  amount: "4000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-12T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "4000.00",
                  installmentNumber: 2,
                  paymentDate: "2026-03-12T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "4000.00",
                  installmentNumber: 3,
                  paymentDate: "2026-04-12T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
          ],
        };
      default:
        return {
          processNumber,
          clientDocument: client.document,
          legalAreaValue,
          statusValue: "ACTIVE",
          feePercentage: "0.3500",
          notes:
            "Contrato seed com multiplas receitas para validar progresso parcial e combinado.",
          allowStatusChange: false,
          isActive: true,
          assignments: [
            {
              employeeEmail: responsibleEmail,
              assignmentTypeValue: "RESPONSIBLE",
            },
            {
              employeeEmail: recommendingEmail,
              assignmentTypeValue: "RECOMMENDING",
            },
            {
              employeeEmail: recommendedEmail,
              assignmentTypeValue: "RECOMMENDED",
            },
            {
              employeeEmail: assistantEmail,
              assignmentTypeValue: "ADMIN_ASSISTANT",
            },
          ],
          revenues: [
            {
              typeValue: "ADMINISTRATIVE",
              totalValue: "16000.00",
              downPaymentValue: "4000.00",
              paymentStartDate: "2026-01-08T00:00:00.000Z",
              totalInstallments: 4,
              isActive: true,
              fees: [
                {
                  amount: "3000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-08T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "3000.00",
                  installmentNumber: 2,
                  paymentDate: "2026-03-08T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
            {
              typeValue: "SUCCUMBENCY",
              totalValue: "6000.00",
              downPaymentValue: null,
              paymentStartDate: "2026-01-18T00:00:00.000Z",
              totalInstallments: 2,
              isActive: true,
              fees: [
                {
                  amount: "3000.00",
                  installmentNumber: 1,
                  paymentDate: "2026-02-18T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
                {
                  amount: "3000.00",
                  installmentNumber: 2,
                  paymentDate: "2026-03-18T00:00:00.000Z",
                  generatesRemuneration: true,
                  isActive: true,
                },
              ],
            },
          ],
        };
    }
  });
}

function mapByKey<TKey, TValue>(
  items: TValue[],
  getKey: (item: TValue) => TKey,
) {
  return new Map(items.map((item) => [getKey(item), item]));
}

function getRequiredMapValue<TKey, TValue>(
  map: Map<TKey, TValue>,
  key: TKey,
  label: string,
) {
  const item = map.get(key);

  if (!item) {
    throw new Error(`Missing required seed reference for ${label}`);
  }

  return item;
}

function getRecommendingReferralPercentage(
  assignments: CreatedContractAssignment[],
) {
  return assignments
    .filter((assignment) => assignment.assignmentTypeValue === "RECOMMENDING")
    .reduce(
      (highest, assignment) =>
        Prisma.Decimal.max(highest, assignment.employee.referralPercentage),
      decimal(0),
    );
}

function getAssignmentEffectivePercentage(
  assignment: CreatedContractAssignment,
  recommendingReferralPercentage: Prisma.Decimal,
) {
  switch (assignment.assignmentTypeValue) {
    case "RESPONSIBLE":
    case "ADMIN_ASSISTANT":
      return assignment.employee.remunerationPercentage;
    case "RECOMMENDING":
      return assignment.employee.referralPercentage;
    case "RECOMMENDED":
      return assignment.employee.remunerationPercentage.minus(
        recommendingReferralPercentage,
      );
    default:
      return decimal(0);
  }
}

async function createFeeRemunerations(params: {
  tx: Prisma.TransactionClient;
  firmId: number;
  feeId: number;
  amount: Prisma.Decimal;
  paymentDate: Date;
  assignments: CreatedContractAssignment[];
  isActive: boolean;
}) {
  const recommendingReferralPercentage = getRecommendingReferralPercentage(
    params.assignments,
  );
  const remunerations = params.assignments.map((assignment) => {
    const effectivePercentage = getAssignmentEffectivePercentage(
      assignment,
      recommendingReferralPercentage,
    );

    return {
      firmId: params.firmId,
      feeId: params.feeId,
      contractEmployeeId: assignment.id,
      effectivePercentage,
      amount: params.amount.mul(effectivePercentage),
      paymentDate: params.paymentDate,
      isSystemGenerated: true,
      isActive: params.isActive,
    };
  });

  if (remunerations.length > 0) {
    await params.tx.remuneration.createMany({
      data: remunerations,
    });
  }
}

async function reconcileContractFinancialFixture(params: {
  tx: Prisma.TransactionClient;
  firmId: number;
  contractSeed: ContractSeedInput;
  clientByDocument: Map<string, ClientRecord>;
  employeeByEmail: Map<string, EmployeeRecord>;
  legalAreaByValue: Map<LegalAreaValue, LookupRecord<LegalAreaValue>>;
  statusByValue: Map<ContractStatusValue, LookupRecord<ContractStatusValue>>;
  assignmentTypeByValue: Map<
    AssignmentTypeValue,
    LookupRecord<AssignmentTypeValue>
  >;
  revenueTypeByValue: Map<RevenueTypeValue, LookupRecord<RevenueTypeValue>>;
}) {
  const client = getRequiredMapValue(
    params.clientByDocument,
    params.contractSeed.clientDocument,
    `client ${params.contractSeed.clientDocument}`,
  );
  const legalArea = getRequiredMapValue(
    params.legalAreaByValue,
    params.contractSeed.legalAreaValue,
    `legal area ${params.contractSeed.legalAreaValue}`,
  );
  const status = getRequiredMapValue(
    params.statusByValue,
    params.contractSeed.statusValue,
    `contract status ${params.contractSeed.statusValue}`,
  );

  const contract = await params.tx.contract.upsert({
    where: {
      firmId_processNumber: {
        firmId: params.firmId,
        processNumber: params.contractSeed.processNumber,
      },
    },
    update: {
      clientId: client.id,
      legalAreaId: legalArea.id,
      statusId: status.id,
      feePercentage: params.contractSeed.feePercentage,
      notes: params.contractSeed.notes,
      allowStatusChange: params.contractSeed.allowStatusChange,
      isActive: params.contractSeed.isActive,
      deletedAt: null,
    },
    create: {
      firmId: params.firmId,
      clientId: client.id,
      legalAreaId: legalArea.id,
      statusId: status.id,
      processNumber: params.contractSeed.processNumber,
      feePercentage: params.contractSeed.feePercentage,
      notes: params.contractSeed.notes,
      allowStatusChange: params.contractSeed.allowStatusChange,
      isActive: params.contractSeed.isActive,
    },
    select: { id: true },
  });

  const existingRevenues = await params.tx.revenue.findMany({
    where: { contractId: contract.id },
    select: {
      id: true,
      fees: {
        select: {
          id: true,
        },
      },
    },
  });
  const existingRevenueIds = existingRevenues.map((revenue) => revenue.id);
  const existingFeeIds = existingRevenues.flatMap((revenue) =>
    revenue.fees.map((fee) => fee.id),
  );

  if (existingFeeIds.length > 0) {
    await params.tx.remuneration.deleteMany({
      where: {
        feeId: {
          in: existingFeeIds,
        },
      },
    });
  }

  if (existingRevenueIds.length > 0) {
    await params.tx.fee.deleteMany({
      where: {
        revenueId: {
          in: existingRevenueIds,
        },
      },
    });
  }

  await params.tx.revenue.deleteMany({
    where: { contractId: contract.id },
  });
  await params.tx.contractEmployee.deleteMany({
    where: { contractId: contract.id },
  });

  const createdAssignments: CreatedContractAssignment[] = [];

  for (const assignmentSeed of params.contractSeed.assignments) {
    const employee = getRequiredMapValue(
      params.employeeByEmail,
      assignmentSeed.employeeEmail,
      `employee ${assignmentSeed.employeeEmail}`,
    );
    const assignmentType = getRequiredMapValue(
      params.assignmentTypeByValue,
      assignmentSeed.assignmentTypeValue,
      `assignment type ${assignmentSeed.assignmentTypeValue}`,
    );
    const assignment = await params.tx.contractEmployee.create({
      data: {
        firmId: params.firmId,
        contractId: contract.id,
        employeeId: employee.id,
        assignmentTypeId: assignmentType.id,
        isActive: assignmentSeed.isActive ?? true,
      },
      select: {
        id: true,
      },
    });

    createdAssignments.push({
      id: assignment.id,
      assignmentTypeValue: assignmentSeed.assignmentTypeValue,
      employee: {
        remunerationPercentage: employee.remunerationPercentage,
        referralPercentage: employee.referralPercentage,
      },
    });
  }

  for (const revenueSeed of params.contractSeed.revenues) {
    const revenueType = getRequiredMapValue(
      params.revenueTypeByValue,
      revenueSeed.typeValue,
      `revenue type ${revenueSeed.typeValue}`,
    );
    const revenue = await params.tx.revenue.create({
      data: {
        firmId: params.firmId,
        contractId: contract.id,
        typeId: revenueType.id,
        totalValue: revenueSeed.totalValue,
        downPaymentValue: revenueSeed.downPaymentValue,
        paymentStartDate: new Date(revenueSeed.paymentStartDate),
        totalInstallments: revenueSeed.totalInstallments,
        isActive: revenueSeed.isActive,
      },
      select: {
        id: true,
      },
    });

    for (const feeSeed of revenueSeed.fees) {
      const fee = await params.tx.fee.create({
        data: {
          firmId: params.firmId,
          revenueId: revenue.id,
          paymentDate: new Date(feeSeed.paymentDate),
          amount: feeSeed.amount,
          installmentNumber: feeSeed.installmentNumber,
          generatesRemuneration: feeSeed.generatesRemuneration,
          isActive: feeSeed.isActive,
        },
        select: {
          id: true,
        },
      });

      if (feeSeed.generatesRemuneration) {
        await createFeeRemunerations({
          tx: params.tx,
          firmId: params.firmId,
          feeId: fee.id,
          amount: decimal(feeSeed.amount),
          paymentDate: new Date(feeSeed.paymentDate),
          assignments: createdAssignments,
          isActive: feeSeed.isActive,
        });
      }
    }
  }
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

  await Promise.all(
    [
      { value: "PDF", label: "PDF" },
      { value: "JPG", label: "JPG" },
      { value: "PNG", label: "PNG" },
    ].map((item) =>
      prisma.attachmentType.upsert({
        where: { value: item.value as AttachmentTypeValue },
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

  const employeeSeeds = createEmployeeSeeds();
  const clientSeeds = createClientSeeds();

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
    employeeSeeds.map((employee) =>
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
    clientSeeds.map((client) =>
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

  const [
    employeeRecords,
    clientRecords,
    legalAreas,
    statuses,
    assignmentTypes,
    revenueTypes,
  ] = await Promise.all([
    prisma.employee.findMany({
      where: { firmId: DEFAULT_FIRM_ID, deletedAt: null },
      select: {
        id: true,
        email: true,
        remunerationPercentage: true,
        referralPercentage: true,
      },
    }),
    prisma.client.findMany({
      where: { firmId: DEFAULT_FIRM_ID, deletedAt: null },
      select: {
        id: true,
        document: true,
      },
    }),
    prisma.legalArea.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
    prisma.contractStatus.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
    prisma.assignmentType.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
    prisma.revenueType.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
  ]);

  const contractSeeds = createContractSeeds(clientSeeds, employeeSeeds);
  const employeeByEmail = mapByKey(
    employeeRecords as EmployeeRecord[],
    (employee) => employee.email,
  );
  const clientByDocument = mapByKey(
    clientRecords as ClientRecord[],
    (client) => client.document,
  );
  const legalAreaByValue = mapByKey(
    legalAreas as LookupRecord<LegalAreaValue>[],
    (item) => item.value,
  );
  const statusByValue = mapByKey(
    statuses as LookupRecord<ContractStatusValue>[],
    (item) => item.value,
  );
  const assignmentTypeByValue = mapByKey(
    assignmentTypes as LookupRecord<AssignmentTypeValue>[],
    (item) => item.value,
  );
  const revenueTypeByValue = mapByKey(
    revenueTypes as LookupRecord<RevenueTypeValue>[],
    (item) => item.value,
  );

  for (const contractSeed of contractSeeds) {
    await prisma.$transaction(async (tx) => {
      await reconcileContractFinancialFixture({
        tx,
        firmId: DEFAULT_FIRM_ID,
        contractSeed,
        clientByDocument,
        employeeByEmail,
        legalAreaByValue,
        statusByValue,
        assignmentTypeByValue,
        revenueTypeByValue,
      });
    });
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
