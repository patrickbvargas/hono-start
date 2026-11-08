import { prisma } from "@/shared/lib/prisma";
import type { LoggedUserSession } from "@/shared/session";
import {
	getPersonReadScope,
	getPersonContractScope as personContractScope,
} from "../data/access";

export const getPersonReadWhere = createServerOnlyFn(
	(session: LoggedUserSession) => getPersonReadScope(session),
);

export const getPersonAccessResource = createServerOnlyFn(
	async ({ session, id }: { session: LoggedUserSession; id: number }) => {
		const person = await prisma.person.findFirst({
			where: { AND: [{ id }, getPersonReadScope(session)] },
			select: { id: true, deletedAt: true },
		});
		if (!person) {
			throw new Error("Pessoa não encontrada.");
		}
		return person;
	},
);

import { createServerOnlyFn } from "@tanstack/react-start";

export const getPersonContractScope = createServerOnlyFn(
	(session: LoggedUserSession) => personContractScope(session),
);
