import type { ClientType } from "@/generated/prisma/client";
import { CLIENT_ERRORS } from "../constants/errors";

export function assertTypeExists(
	type: ClientType | null,
): asserts type is ClientType {
	if (!type) {
		throw new Error(CLIENT_ERRORS.TYPE_NOT_FOUND);
	}
}

export function assertTypeCanBeSelected(
	type: ClientType,
	currentTypeId?: number,
) {
	if (type && !type.isActive && type.id !== currentTypeId) {
		throw new Error(CLIENT_ERRORS.TYPE_INACTIVE);
	}
}
