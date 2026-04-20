import { CLIENT_ERRORS } from "../constants/errors";
import {
	CLIENT_DOCUMENT_REGEX,
	CLIENT_TYPE_COMPANY_VALUE,
	CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants/values";

function isRepeatedDigits(value: string) {
	return /^(\d)\1+$/.test(value);
}

function isValidCPF(cpf: string) {
	cpf = cpf.replace(CLIENT_DOCUMENT_REGEX, "");

	if (cpf.length !== 11 || isRepeatedDigits(cpf)) {
		return false;
	}

	let sum = 0;
	for (let index = 0; index < 9; index += 1) {
		sum += Number(cpf[index]) * (10 - index);
	}

	let remainder = (sum * 10) % 11;
	if (remainder === 10) {
		remainder = 0;
	}

	if (remainder !== Number(cpf[9])) {
		return false;
	}

	sum = 0;
	for (let index = 0; index < 10; index += 1) {
		sum += Number(cpf[index]) * (11 - index);
	}

	remainder = (sum * 10) % 11;
	if (remainder === 10) {
		remainder = 0;
	}

	return remainder === Number(cpf[10]);
}

function isValidCNPJ(cnpj: string) {
	cnpj = cnpj.replace(CLIENT_DOCUMENT_REGEX, "");

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

interface ClientDocumentInput {
	type: string;
	document: string;
}

export function assertDocumentMatchesType({
	type,
	document,
}: ClientDocumentInput) {
	if (type === CLIENT_TYPE_INDIVIDUAL_VALUE && !isValidCPF(document)) {
		throw new Error(CLIENT_ERRORS.DOCUMENT_CPF_INVALID);
	}

	if (type === CLIENT_TYPE_COMPANY_VALUE && !isValidCNPJ(document)) {
		throw new Error(CLIENT_ERRORS.DOCUMENT_CNPJ_INVALID);
	}
}
