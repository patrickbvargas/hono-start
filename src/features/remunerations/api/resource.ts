import { prisma } from "@/shared/lib/prisma";
import type {
	LoggedUserSession,
	RemunerationAccessResource,
} from "@/shared/session";
import { assertCan, getServerScope } from "@/shared/session";
import { REMUNERATION_ERRORS } from "../constants/errors";

export async function getRemunerationAccessResourceById(id: number) {
	const scope = getServerScope("remuneration");
	const remuneration = await prisma.remuneration.findFirst({
		where: {
			id,
			firmId: scope.firmId,
		},
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			contractEmployee: {
				select: {
					employeeId: true,
					contract: {
						select: {
							processNumber: true,
						},
					},
				},
			},
			fee: {
				select: {
					deletedAt: true,
				},
			},
		},
	});

	if (!remuneration) {
		return null;
	}

	return {
		id: remuneration.id,
		deletedAt: remuneration.deletedAt,
		parentFeeIsSoftDeleted: remuneration.fee.deletedAt !== null,
		contractProcessNumber: remuneration.contractEmployee.contract.processNumber,
		resource: {
			firmId: remuneration.firmId,
			employeeId: remuneration.contractEmployee.employeeId,
		} satisfies RemunerationAccessResource,
	};
}

export async function requireRemunerationAccessResourceById(id: number) {
	const remuneration = await getRemunerationAccessResourceById(id);

	if (!remuneration) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_NOT_FOUND);
	}

	return remuneration;
}

export async function assertCanAccessRemunerationById(
	session: LoggedUserSession,
	action:
		| "remuneration.view"
		| "remuneration.update"
		| "remuneration.delete"
		| "remuneration.restore",
	id: number,
) {
	const remuneration = await requireRemunerationAccessResourceById(id);
	assertCan(session, action, remuneration.resource);
	return remuneration;
}
