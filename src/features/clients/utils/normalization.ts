import { CLIENT_DOCUMENT_REGEX } from "../constants/values";

export function normalizeClientDocument(value: string) {
	return value.trim().replace(CLIENT_DOCUMENT_REGEX, "");
}

export function normalizeClientPhone(value: string) {
	return value.trim().replace(CLIENT_DOCUMENT_REGEX, "");
}
