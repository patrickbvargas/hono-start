import { formatter } from "@/shared/lib/formatter";

type AuditSegment = number | string;

interface AuditChangeEntryBase {
	label: string;
	path: string;
}

export interface AuditChangeDiffEntry extends AuditChangeEntryBase {
	after: string;
	before: string;
}

export interface AuditChangeValueEntry extends AuditChangeEntryBase {
	value: string;
}

type AuditChangeMode = "diff" | "snapshot" | "raw";

export interface AuditChangePresentation {
	entries: AuditChangeDiffEntry[] | AuditChangeValueEntry[];
	mode: AuditChangeMode;
	rawJson: string | null;
	title: string;
}

const FIELD_LABELS: Record<string, string> = {
	action: "Ação",
	actorName: "Usuário",
	allowStatusChange: "Permite mudança de status",
	amount: "Valor",
	assignments: "Equipe",
	assignmentType: "Tipo de vínculo",
	authAccessRevoked: "Acesso revogado",
	client: "Cliente",
	clientId: "Cliente",
	contractEmployeeId: "Vínculo",
	contractId: "Contrato",
	contractStatus: "Status do contrato",
	contractStatusValue: "Status do contrato",
	createdAt: "Criado em",
	dateFrom: "Data inicial",
	dateTo: "Data final",
	deletedAt: "Removido em",
	document: "Documento",
	effectivePercentage: "% Efetivo",
	email: "E-mail",
	entityId: "ID da entidade",
	entityName: "Entidade",
	entityType: "Tipo",
	feeAmount: "Valor do honorário",
	feeId: "Honorário",
	feeInstallmentNumber: "Parcela do honorário",
	feePercentage: "% Honorários",
	fileName: "Arquivo",
	fileSize: "Tamanho do arquivo",
	fullName: "Nome",
	generatesRemuneration: "Gera remuneração",
	id: "ID",
	installmentNumber: "Parcela",
	ipAddress: "Endereço IP",
	isAccessEnabled: "Acesso ao sistema",
	isActive: "Ativo",
	isManualOverride: "Ajuste manual",
	isSoftDeleted: "Excluído",
	legalArea: "Área",
	legalAreaId: "Área",
	loginIdentifierChanged: "Identificador de login alterado",
	mimeType: "Tipo do arquivo",
	mustChangePassword: "Troca obrigatória de senha",
	notes: "Observações",
	oabNumber: "OAB",
	ownerId: "Registro vinculado",
	ownerKind: "Contexto vinculado",
	paymentDate: "Data de pagamento",
	paymentStartDate: "Início do pagamento",
	phone: "Telefone",
	processNumber: "Processo",
	query: "Busca",
	referrerPercent: "% Indicação",
	remunerationCount: "Remunerações vinculadas",
	remunerationPercent: "% Remuneração",
	revenueId: "Receita",
	revenues: "Receitas",
	revenueType: "Tipo de receita",
	role: "Perfil",
	status: "Status",
	statusId: "Status",
	totalInstallments: "Total de parcelas",
	totalValue: "Valor total",
	type: "Tipo",
	typeId: "Tipo",
	updatedAt: "Atualizado em",
	userAgent: "Navegador",
};

const LOOKUP_VALUE_LABELS: Record<string, string> = {
	ACTIVE: "Ativo",
	ADMIN: "Administrador",
	ADMINISTRATIVE: "Administrativo",
	ADMIN_ASSISTANT: "Assistente Administrativo",
	CANCELLED: "Cancelado",
	CIVIL: "Cível",
	COMPANY: "Pessoa Jurídica",
	COMPLETED: "Concluído",
	CREATE: "Criar",
	DELETE: "Excluir",
	FAMILY: "Família",
	GRANT_ACCESS: "Conceder acesso",
	INDIVIDUAL: "Pessoa Física",
	JPG: "JPG",
	JUDICIAL: "Judicial",
	LABOR: "Trabalhista",
	LAWYER: "Advogado",
	OTHER: "Outros",
	PDF: "PDF",
	PNG: "PNG",
	RECOMMENDED: "Indicado",
	RECOMMENDING: "Indicante",
	RESET_PASSWORD: "Redefinir senha",
	RESPONSIBLE: "Responsável",
	RESTORE: "Restaurar",
	REVOKE_ACCESS: "Revogar acesso",
	SOCIAL_SECURITY: "Previdenciário",
	SUCCUMBENCY: "Sucumbência",
	UPDATE: "Atualizar",
	USER: "Usuário",
};

const CURRENCY_KEYS = new Set([
	"amount",
	"downPaymentValue",
	"feeAmount",
	"totalValue",
]);

const PERCENT_KEYS = new Set([
	"effectivePercentage",
	"feePercentage",
	"referrerPercent",
	"remunerationPercent",
]);

const DATE_KEYS = new Set([
	"createdAt",
	"deletedAt",
	"paymentDate",
	"paymentStartDate",
	"updatedAt",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	return true;
}

function buildPath(segments: AuditSegment[]) {
	return segments.reduce<string>((path, segment) => {
		if (typeof segment === "number") {
			return `${path}[${segment}]`;
		}

		if (path.length === 0) {
			return segment;
		}

		return `${path}.${segment}`;
	}, "");
}

function humanizeSegment(segment: string) {
	return segment
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replaceAll("-", " ")
		.toLowerCase()
		.replace(/^./, (value) => value.toUpperCase());
}

function buildLabel(segments: AuditSegment[]) {
	const parts = segments.map((segment, index) => {
		if (typeof segment === "number") {
			return String(segment + 1);
		}

		const previous = segments[index - 1];
		const label = FIELD_LABELS[segment] ?? humanizeSegment(segment);

		if (typeof previous === "number") {
			return label;
		}

		return label;
	});

	return parts.join(" / ");
}

function looksLikeDate(value: string) {
	if (value.length < 10) {
		return false;
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return true;
	}

	return !Number.isNaN(Date.parse(value));
}

function formatOwnerKind(value: string) {
	const ownerLabels: Record<string, string> = {
		client: "Cliente",
		contract: "Contrato",
		employee: "Colaborador",
	};

	return ownerLabels[value] ?? value;
}

function formatValue(key: string | undefined, value: unknown): string {
	if (value === null || value === undefined || value === "") {
		return "—";
	}

	if (typeof value === "boolean") {
		return value ? "Sim" : "Não";
	}

	if (typeof value === "number") {
		if (key && PERCENT_KEYS.has(key)) {
			return formatter.percent(value);
		}

		if (key && CURRENCY_KEYS.has(key)) {
			return formatter.currency(value);
		}

		if (key === "fileSize") {
			return `${value} bytes`;
		}

		return String(value);
	}

	if (typeof value === "string") {
		if (key === "oabNumber") {
			return formatter.oab(value);
		}

		if (key === "ownerKind") {
			return formatOwnerKind(value);
		}

		if (LOOKUP_VALUE_LABELS[value]) {
			return LOOKUP_VALUE_LABELS[value];
		}

		if ((key && DATE_KEYS.has(key)) || looksLikeDate(value)) {
			return formatter.date(value);
		}

		return value;
	}

	return JSON.stringify(value, null, 2);
}

function areEqualValues(
	left: unknown,
	right: unknown,
	key: string | undefined,
) {
	if (left === right) {
		return true;
	}

	if (typeof left === "number" && typeof right === "number") {
		return Object.is(left, right);
	}

	if (
		!isPlainObject(left) &&
		!isPlainObject(right) &&
		!Array.isArray(left) &&
		!Array.isArray(right)
	) {
		return formatValue(key, left) === formatValue(key, right);
	}

	return JSON.stringify(left) === JSON.stringify(right);
}

function collectDiffEntries(
	before: unknown,
	after: unknown,
	segments: AuditSegment[] = [],
): AuditChangeDiffEntry[] {
	if (isPlainObject(before) && isPlainObject(after)) {
		const keys = Object.keys(after);

		return keys.flatMap((key) =>
			collectDiffEntries(before[key], after[key], [...segments, key]),
		);
	}

	if (Array.isArray(before) && Array.isArray(after)) {
		const maxLength = Math.max(before.length, after.length);

		return Array.from({ length: maxLength }, (_, index) =>
			collectDiffEntries(before[index], after[index], [...segments, index]),
		).flat();
	}

	const path = buildPath(segments);
	const lastSegment = segments.at(-1);
	const key = typeof lastSegment === "string" ? lastSegment : undefined;

	if (areEqualValues(before, after, key)) {
		return [];
	}

	return [
		{
			label: buildLabel(segments),
			path,
			before: formatValue(key, before),
			after: formatValue(key, after),
		},
	];
}

function collectValueEntries(
	value: unknown,
	segments: AuditSegment[] = [],
): AuditChangeValueEntry[] {
	if (isPlainObject(value)) {
		return Object.entries(value).flatMap(([key, nestedValue]) =>
			collectValueEntries(nestedValue, [...segments, key]),
		);
	}

	if (Array.isArray(value)) {
		return value.flatMap((nestedValue, index) =>
			collectValueEntries(nestedValue, [...segments, index]),
		);
	}

	const path = buildPath(segments);
	const lastSegment = segments.at(-1);
	const key = typeof lastSegment === "string" ? lastSegment : undefined;

	return [
		{
			label: buildLabel(segments),
			path,
			value: formatValue(key, value),
		},
	];
}

function extractBeforeAfter(changeData: unknown) {
	if (!isPlainObject(changeData)) {
		return null;
	}

	const before = "before" in changeData ? changeData.before : undefined;
	const after = "after" in changeData ? changeData.after : undefined;

	if (before === undefined && after === undefined) {
		return null;
	}

	return { before, after };
}

function stringifyRaw(changeData: unknown) {
	if (changeData === undefined) {
		return null;
	}

	try {
		return JSON.stringify(changeData, null, 2);
	} catch {
		return String(changeData);
	}
}

export function buildAuditChangePresentation(params: {
	action: string;
	changeData: unknown;
}) {
	const extracted = extractBeforeAfter(params.changeData);
	const rawJson = stringifyRaw(params.changeData);

	if (extracted) {
		const diffEntries = collectDiffEntries(extracted.before, extracted.after);
		if (diffEntries.length > 0) {
			return {
				mode: "diff",
				title: "Mudanças realizadas",
				entries: diffEntries,
				rawJson,
			} satisfies AuditChangePresentation;
		}

		if (extracted.after !== undefined) {
			return {
				mode: "snapshot",
				title:
					params.action === "CREATE" ? "Dados registrados" : "Estado final",
				entries: collectValueEntries(extracted.after),
				rawJson,
			} satisfies AuditChangePresentation;
		}

		if (extracted.before !== undefined) {
			return {
				mode: "snapshot",
				title: "Estado registrado",
				entries: collectValueEntries(extracted.before),
				rawJson,
			} satisfies AuditChangePresentation;
		}
	}

	if (isPlainObject(params.changeData) || Array.isArray(params.changeData)) {
		return {
			mode: "snapshot",
			title: "Dados registrados",
			entries: collectValueEntries(params.changeData),
			rawJson,
		} satisfies AuditChangePresentation;
	}

	return {
		mode: "raw",
		title: "Payload registrado",
		entries: [],
		rawJson,
	} satisfies AuditChangePresentation;
}
