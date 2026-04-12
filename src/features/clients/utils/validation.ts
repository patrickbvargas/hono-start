import type { ClientType, PrismaClient } from "@/generated/prisma/client";
import {
	CLIENT_TYPE_COMPANY_VALUE,
	CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants";

const ONLY_DIGITS_REGEX = /\D/g;

export function normalizeClientDocument(value: string) {
	return value.replace(ONLY_DIGITS_REGEX, "");
}

export function normalizeOptionalText(value?: string | null) {
	const normalized = value?.trim() ?? "";
	return normalized.length > 0 ? normalized : null;
}

function isRepeatedDigits(value: string) {
	return /^(\d)\1+$/.test(value);
}

export function isValidCpf(value: string) {
	const cpf = normalizeClientDocument(value);

	if (cpf.length !== 11 || isRepeatedDigits(cpf)) {
		return false;
	}

	let sum = 0;
	for (let index = 0; index < 9; index += 1) {
		sum += Number(cpf[index]) * (10 - index);
	}

	let remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;
	if (remainder !== Number(cpf[9])) {
		return false;
	}

	sum = 0;
	for (let index = 0; index < 10; index += 1) {
		sum += Number(cpf[index]) * (11 - index);
	}

	remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;

	return remainder === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
	const cnpj = normalizeClientDocument(value);

	if (cnpj.length !== 14 || isRepeatedDigits(cnpj)) {
		return false;
	}

	const calculateDigit = (base: string, factors: number[]) => {
		const total = base
			.split("")
			.reduce(
				(sum, char, index) => sum + Number(char) * (factors[index] ?? 0),
				0,
			);
		const remainder = total % 11;

		return remainder < 2 ? 0 : 11 - remainder;
	};

	const firstDigit = calculateDigit(
		cnpj.slice(0, 12),
		[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
	);
	if (firstDigit !== Number(cnpj[12])) {
		return false;
	}

	const secondDigit = calculateDigit(
		cnpj.slice(0, 13),
		[6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
	);

	return secondDigit === Number(cnpj[13]);
}

export function getClientDocumentValidationMessage(
	typeValue: string,
	value: string,
) {
	const document = normalizeClientDocument(value);

	if (!document) {
		return "Documento é obrigatório";
	}

	if (typeValue === CLIENT_TYPE_INDIVIDUAL_VALUE) {
		return isValidCpf(document) ? null : "CPF inválido";
	}

	if (typeValue === CLIENT_TYPE_COMPANY_VALUE) {
		return isValidCnpj(document) ? null : "CNPJ inválido";
	}

	return "Tipo de cliente inválido";
}

export function formatClientDocument(value: string | null) {
	if (!value) return "—";

	const document = normalizeClientDocument(value);
	if (document.length === 11) {
		return `${document.slice(0, 3)}.${document.slice(3, 6)}.${document.slice(6, 9)}-${document.slice(9)}`;
	}

	if (document.length === 14) {
		return `${document.slice(0, 2)}.${document.slice(2, 5)}.${document.slice(5, 8)}/${document.slice(8, 12)}-${document.slice(12)}`;
	}

	return value;
}

export function getClientNameLabel(typeValue?: string | null) {
	return typeValue === CLIENT_TYPE_COMPANY_VALUE ? "Razão Social" : "Nome";
}

export function getClientDocumentLabel(typeValue?: string | null) {
	return typeValue === CLIENT_TYPE_COMPANY_VALUE ? "CNPJ" : "CPF";
}

export function getClientDocumentPlaceholder(typeValue?: string | null) {
	return typeValue === CLIENT_TYPE_COMPANY_VALUE
		? "00.000.000/0000-00"
		: "000.000.000-00";
}

interface ClientTypeSelection {
	type: ClientType;
}

interface ClientTypeSelectionInput {
	type: string;
}

interface ClientTypeValidationOptions {
	currentTypeId?: number;
}

export function validateClientTypeSelection(
	selection: ClientTypeSelection,
	options: ClientTypeValidationOptions = {},
) {
	if (!selection.type.isActive && selection.type.id !== options.currentTypeId) {
		throw new Error("Selecione um tipo de cliente ativo");
	}
}

export function validateImmutableClientType(
	selection: ClientTypeSelection,
	options: ClientTypeValidationOptions = {},
) {
	if (options.currentTypeId && selection.type.id !== options.currentTypeId) {
		throw new Error("O tipo do cliente não pode ser alterado");
	}
}

export async function resolveClientTypeSelection(
	prisma: PrismaClient,
	input: ClientTypeSelectionInput,
) {
	const type = await prisma.clientType.findUnique({
		where: { value: input.type },
	});

	if (!type) {
		throw new Error("Tipo de cliente não encontrado");
	}

	return { type };
}
