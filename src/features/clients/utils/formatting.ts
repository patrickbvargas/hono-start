import { CLIENT_TYPE_COMPANY_VALUE } from "../constants";

export function formatClientDocument(document: string | null) {
	if (!document) return "—";

	if (document.length === 11) {
		return `${document.slice(0, 3)}.${document.slice(3, 6)}.${document.slice(6, 9)}-${document.slice(9)}`;
	}

	if (document.length === 14) {
		return `${document.slice(0, 2)}.${document.slice(2, 5)}.${document.slice(5, 8)}/${document.slice(8, 12)}-${document.slice(12)}`;
	}

	return document;
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
