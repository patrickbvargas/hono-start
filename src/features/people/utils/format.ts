import { PERSON_TYPE_COMPANY_VALUE } from "../constants/values";

export function formatPersonDocument(document: string | null) {
	if (!document) {
		return "—";
	}

	if (document.length === 11) {
		return `${document.slice(0, 3)}.${document.slice(3, 6)}.${document.slice(6, 9)}-${document.slice(9)}`;
	}

	if (document.length === 14) {
		return `${document.slice(0, 2)}.${document.slice(2, 5)}.${document.slice(5, 8)}/${document.slice(8, 12)}-${document.slice(12)}`;
	}

	return document;
}

export function getPersonNameLabel(typeValue?: string | null) {
	return typeValue === PERSON_TYPE_COMPANY_VALUE ? "Razão Social" : "Nome";
}

export function getPersonDocumentLabel(typeValue?: string | null) {
	return typeValue === PERSON_TYPE_COMPANY_VALUE ? "CNPJ" : "CPF";
}

export function getPersonDocumentPlaceholder(typeValue?: string | null) {
	return typeValue === PERSON_TYPE_COMPANY_VALUE
		? "00.000.000/0000-00"
		: "000.000.000-00";
}
