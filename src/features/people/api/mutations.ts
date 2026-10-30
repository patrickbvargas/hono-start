import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/shared/session/server";
import {
	createPerson,
	deletePerson,
	restorePerson,
	updatePerson,
} from "../data/mutations";
import {
	personCreateInputSchema,
	personIdInputSchema,
	personUpdateInputSchema,
} from "../schemas/form";

const createFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(personCreateInputSchema)
	.handler(({ data, context }) =>
		createPerson({ session: context.session, input: data }),
	);
const updateFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(personUpdateInputSchema)
	.handler(({ data, context }) =>
		updatePerson({ session: context.session, input: data }),
	);
const deleteFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(personIdInputSchema)
	.handler(({ data, context }) =>
		deletePerson({ session: context.session, id: data.id }),
	);
const restoreFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(personIdInputSchema)
	.handler(({ data, context }) =>
		restorePerson({ session: context.session, id: data.id }),
	);
export const createPersonMutationOptions = () =>
	mutationOptions({ mutationFn: createFn });
export const updatePersonMutationOptions = () =>
	mutationOptions({ mutationFn: updateFn });
export const deletePersonMutationOptions = () =>
	mutationOptions({ mutationFn: deleteFn });
export const restorePersonMutationOptions = () =>
	mutationOptions({ mutationFn: restoreFn });
