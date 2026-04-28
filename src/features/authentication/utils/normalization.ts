const OAB_IDENTIFIER_REGEX = /^[A-Z]{2}\d{6}$/;

export function normalizeAuthenticationIdentifier(identifier: string) {
	const trimmed = identifier.trim();

	if (trimmed.includes("@")) {
		return trimmed.toLowerCase();
	}

	return trimmed.replaceAll(/\W/g, "").toUpperCase();
}

export function isEmailIdentifier(identifier: string) {
	return identifier.includes("@");
}

export function isOabIdentifier(identifier: string) {
	return OAB_IDENTIFIER_REGEX.test(identifier);
}
