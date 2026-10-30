import { PERSON_DOCUMENT_REGEX } from "../constants/values";

export function normalizePersonDocument(value: string) {
	return value.trim().replace(PERSON_DOCUMENT_REGEX, "");
}

export function normalizePersonPhone(value: string) {
	return value.trim().replace(PERSON_DOCUMENT_REGEX, "");
}
