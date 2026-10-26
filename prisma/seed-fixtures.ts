export type EmployeeTypeValue = "LAWYER" | "ADMIN_ASSISTANT";
export type UserRoleValue = "ADMIN" | "USER";
export type ClientTypeValue = "INDIVIDUAL" | "COMPANY";
export type LegalAreaValue =
	| "SOCIAL_SECURITY"
	| "CIVIL"
	| "FAMILY"
	| "LABOR"
	| "OTHER";
export type ContractStatusValue = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AssignmentTypeValue =
	| "RESPONSIBLE"
	| "RECOMMENDING"
	| "RECOMMENDED"
	| "ADMIN_ASSISTANT";
export type RevenueTypeValue = "ADMINISTRATIVE" | "JUDICIAL" | "SUCCUMBENCY";
export type AttachmentTypeValue = "PDF" | "JPG" | "PNG";
export type ExpenseCategoryValue =
	| "PAYROLL_LAWYERS"
	| "PAYROLL_INTERNS"
	| "PAYROLL_STAFF"
	| "TAX_PIS"
	| "TAX_IRPJ"
	| "TAX_COFINS"
	| "TAX_ISSQN"
	| "TAX_CSLL"
	| "TAX_OTHER"
	| "PHONE"
	| "MEDIA"
	| "POSTAGE"
	| "CONDOMINIUM"
	| "ELECTRICITY"
	| "MEALS"
	| "ASSETS"
	| "SUPPLIES"
	| "NOTARY"
	| "COURT_COSTS"
	| "OTHER";

export interface EmployeeSeedInput {
	createdAt?: string;
	deletedAt?: string | null;
	fullName: string;
	email: string;
	typeValue: EmployeeTypeValue;
	roleValue: UserRoleValue;
	remunerationPercentage: string;
	referralPercentage: string;
	isActive: boolean;
	oabNumber?: string;
}

export interface ClientSeedInput {
	createdAt?: string;
	deletedAt?: string | null;
	fullName: string;
	document: string;
	typeValue: ClientTypeValue;
	email: string | null;
	phone: string | null;
	isActive: boolean;
}

export interface ContractAssignmentSeedInput {
	employeeEmail: string;
	assignmentTypeValue: AssignmentTypeValue;
	isActive?: boolean;
}

export interface FeeSeedInput {
	manualAdjustment?: boolean;
	createdAt?: string;
	deletedAt?: string | null;
	amount: string;
	installmentNumber: number;
	paymentDate: string;
	generatesRemuneration: boolean;
	isActive: boolean;
}

export interface RevenueSeedInput {
	createdAt: string;
	deletedAt?: string | null;
	typeValue: RevenueTypeValue;
	totalValue: string;
	downPaymentValue: string | null;
	paymentStartDate: string;
	totalInstallments: number;
	isActive: boolean;
	fees: FeeSeedInput[];
}

export interface ContractSeedInput {
	createdAt: string;
	deletedAt?: string | null;
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

export interface ExpenseSeedInput {
	createdAt: string;
	deletedAt?: string | null;
	categoryValue: ExpenseCategoryValue;
	expenseDate: string;
	amount: string;
	notes: string | null;
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

export function createEmployeeSeeds(): EmployeeSeedInput[] {
	const seededAdminEmployee: EmployeeSeedInput = {
		fullName: "Patrick Vargas",
		email: "admin@hono.com",
		typeValue: "LAWYER",
		roleValue: "ADMIN",
		remunerationPercentage: "0.3500",
		referralPercentage: "0.1000",
		isActive: true,
		oabNumber: createOabNumber(0),
	};

	const lawyerNames = [
		"Amanda Azevedo",
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
				? "amanda@hono.com"
				: index === 2
					? "carlos@hono.com"
					: `${fullName.toLowerCase().replaceAll(" ", ".")}@hono.com`,
		typeValue: "LAWYER" as const,
		roleValue: index < 2 ? ("ADMIN" as const) : ("USER" as const),
		remunerationPercentage: index < 4 ? "0.3500" : "0.3000",
		referralPercentage: index < 6 ? "0.1000" : "0.0500",
		isActive: index !== 10,
		oabNumber: createOabNumber(index + 1),
	}));

	const assistants = assistantNames.map((fullName, index) => ({
		fullName,
		email: `${fullName.toLowerCase().replaceAll(" ", ".")}@hono.com`,
		typeValue: "ADMIN_ASSISTANT" as const,
		roleValue: "USER" as const,
		remunerationPercentage: index < 4 ? "0.1200" : "0.1500",
		referralPercentage: "0.0000",
		isActive: index !== 6,
	}));

	return [seededAdminEmployee, ...lawyers, ...assistants];
}

export function createClientSeeds(): ClientSeedInput[] {
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
		email: `cliente${index + 1}@hono.com`,
		phone: createPhone(index + 1),
		isActive: index !== 10,
	}));

	const companies = companyNames.map((fullName, index) => ({
		fullName,
		document: createCnpj(index + 1),
		typeValue: "COMPANY" as const,
		email: `contato${index + 1}@empresa.hono.com`,
		phone: createPhone(index + 21),
		isActive: index !== 6,
	}));

	return [...individuals, ...companies];
}
