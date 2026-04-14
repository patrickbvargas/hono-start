import { CLIENT_TYPE_COMPANY_VALUE } from "../constants";
import { normalizeClientDocument } from "./normalization";

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
