import type { PersonType } from "@/generated/prisma/client";
import { PERSON_ERRORS } from "../constants/errors";

export function assertTypeExists(
	type: PersonType | null,
): asserts type is PersonType {
	if (!type) {
		throw new Error(PERSON_ERRORS.TYPE_NOT_FOUND);
	}
}

export function assertTypeCanBeSelected(
	type: PersonType,
	currentTypeId?: number,
) {
	if (type && !type.isActive && type.id !== currentTypeId) {
		throw new Error(PERSON_ERRORS.TYPE_INACTIVE);
	}
}
