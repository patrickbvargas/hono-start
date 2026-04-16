import type { ClientType } from "@/generated/prisma/client";
import { CLIENT_ERRORS } from "../constants/errors";

export function assertClientTypeExists(
	type: ClientType | null,
): asserts type is ClientType {
	if (!type) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_NOT_FOUND);
	}
}

export function assertClientTypeCanBeSelected(
	type: ClientType,
	currentTypeId?: number,
) {
	if (!type.isActive && type.id !== currentTypeId) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_INACTIVE);
	}
}

export function assertClientTypeImmutableOnUpdate(
	type: ClientType,
	currentTypeId?: number,
) {
	if (currentTypeId && type.id !== currentTypeId) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_NOT_MUTABLE);
	}
}
