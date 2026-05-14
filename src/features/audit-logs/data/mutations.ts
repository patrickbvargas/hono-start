import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export interface AuditLogActor {
	id: number;
	name: string;
	email: string | null;
}

export interface CreateAuditLogInput {
	firmId: number;
	actor?: AuditLogActor;
	action: string;
	entityType: string;
	entityId: number | string | null;
	entityName: string;
	changeData: unknown;
	description: string;
	ipAddress?: string | null;
	userAgent?: string | null;
}

type AuditLogDb = PrismaClient | Prisma.TransactionClient;

type AuditJsonLike =
	| null
	| boolean
	| number
	| string
	| AuditJsonLike[]
	| { [key: string]: AuditJsonLike };

const BEFORE_VALUE_KEY_ALIASES: Record<string, string[]> = {
	legalArea: ["legalAreaValue"],
	role: ["roleValue"],
	status: ["statusValue"],
	type: ["typeValue"],
	revenueType: ["revenueTypeValue"],
};

function toAuditJson(value: unknown): Prisma.InputJsonValue {
	return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function isPlainObject(
	value: unknown,
): value is Record<string, AuditJsonLike | unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getBeforeValue(
	before: Record<string, AuditJsonLike | unknown>,
	key: string,
	afterValue: AuditJsonLike | unknown,
) {
	if (typeof afterValue === "string") {
		for (const alias of BEFORE_VALUE_KEY_ALIASES[key] ?? []) {
			if (alias in before) {
				return before[alias];
			}
		}
	}

	return before[key];
}

function alignValueToAfterShape(
	beforeValue: AuditJsonLike | unknown,
	afterValue: AuditJsonLike | unknown,
): AuditJsonLike | undefined {
	if (Array.isArray(afterValue)) {
		if (!Array.isArray(beforeValue)) {
			return undefined;
		}

		return afterValue.map(
			(item, index) => alignValueToAfterShape(beforeValue[index], item) ?? null,
		);
	}

	if (isPlainObject(afterValue)) {
		const beforeObject = isPlainObject(beforeValue) ? beforeValue : {};

		return Object.fromEntries(
			Object.entries(afterValue).map(([key, value]) => [
				key,
				alignValueToAfterShape(getBeforeValue(beforeObject, key, value), value),
			]),
		) as AuditJsonLike;
	}

	if (afterValue === null) {
		return beforeValue == null ? null : String(beforeValue);
	}

	if (typeof afterValue === "string") {
		if (beforeValue == null) {
			return "";
		}

		return String(beforeValue);
	}

	if (typeof afterValue === "number") {
		if (typeof beforeValue === "number") {
			return beforeValue;
		}

		if (typeof beforeValue === "string" && beforeValue.trim() !== "") {
			const parsed = Number(beforeValue);
			return Number.isNaN(parsed) ? undefined : parsed;
		}

		return undefined;
	}

	if (typeof afterValue === "boolean") {
		if (typeof beforeValue === "boolean") {
			return beforeValue;
		}

		return undefined;
	}

	return undefined;
}

function areAuditValuesEqual(
	left: AuditJsonLike | undefined,
	right: AuditJsonLike,
) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function buildChangedAuditValues(
	before: AuditJsonLike | unknown,
	after: AuditJsonLike | unknown,
): { before: AuditJsonLike; after: AuditJsonLike } | null {
	if (!isPlainObject(after)) {
		return null;
	}

	const beforeObject = isPlainObject(before) ? before : {};
	const changedBefore: Record<string, AuditJsonLike> = {};
	const changedAfter: Record<string, AuditJsonLike> = {};

	for (const [key, afterValue] of Object.entries(after)) {
		const alignedBefore = alignValueToAfterShape(
			getBeforeValue(beforeObject, key, afterValue),
			afterValue,
		);

		if (!areAuditValuesEqual(alignedBefore, afterValue as AuditJsonLike)) {
			changedBefore[key] = (alignedBefore ?? null) as AuditJsonLike;
			changedAfter[key] = afterValue as AuditJsonLike;
		}
	}

	if (Object.keys(changedAfter).length === 0) {
		return null;
	}

	return {
		before: changedBefore,
		after: changedAfter,
	};
}

export function buildAuditUpdateChangeData(params: {
	before: AuditJsonLike | unknown;
	after: AuditJsonLike | unknown;
}) {
	return (
		buildChangedAuditValues(params.before, params.after) ?? {
			before: {},
			after: {},
		}
	);
}

export async function createAuditLog(
	db: AuditLogDb,
	{
		firmId,
		actor,
		action,
		entityType,
		entityId,
		entityName,
		changeData,
		description,
		ipAddress = null,
		userAgent = null,
	}: CreateAuditLogInput,
) {
	await db.auditLog.create({
		data: {
			firmId,
			actorId: actor?.id ?? null,
			actorName: actor?.name ?? "Sistema",
			actorEmail: actor?.email ?? null,
			action,
			entityType,
			entityId: entityId == null ? null : String(entityId),
			entityName,
			changeData: toAuditJson(changeData),
			description,
			ipAddress,
			userAgent,
		},
	});
}
