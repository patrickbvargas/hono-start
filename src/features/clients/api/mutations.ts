import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { assertCan, authMiddleware, getScope } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import {
	createClient,
	deleteClient,
	restoreClient,
	updateClient,
} from "../data/mutations";
import {
	clientCreateInputSchema,
	clientIdInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";

const createClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(clientCreateInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			assertCan(context.session, "client.create");
			const { firmId } = getScope(context.session, "client");

			return await createClient({
				actor: {
					id: context.session.employee.id,
					name: context.session.user.fullName,
					email: context.session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[createClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"])) {
				throw new Error(CLIENT_ERRORS.DOCUMENT_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}

			throw new Error(CLIENT_ERRORS.CREATE_FAILED);
		}
	});

const updateClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(clientUpdateInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			assertCan(context.session, "client.update");
			const { firmId } = getScope(context.session, "client");

			return await updateClient({
				actor: {
					id: context.session.employee.id,
					name: context.session.user.fullName,
					email: context.session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[updateClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"])) {
				throw new Error(CLIENT_ERRORS.DOCUMENT_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}

			throw new Error(CLIENT_ERRORS.UPDATE_FAILED);
		}
	});

const deleteClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			assertCan(context.session, "client.delete");
			const { firmId } = getScope(context.session, "client");

			return await deleteClient({
				actor: {
					id: context.session.employee.id,
					name: context.session.user.fullName,
					email: context.session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteClient]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}

			throw new Error(CLIENT_ERRORS.DELETE_FAILED);
		}
	});

const restoreClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			assertCan(context.session, "client.restore");
			const { firmId } = getScope(context.session, "client");

			return await restoreClient({
				actor: {
					id: context.session.employee.id,
					name: context.session.user.fullName,
					email: context.session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[restoreClient]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}

			throw new Error(CLIENT_ERRORS.RESTORE_FAILED);
		}
	});

export const createClientMutationOptions = () =>
	mutationOptions({ mutationFn: createClientFn });

export const updateClientMutationOptions = () =>
	mutationOptions({ mutationFn: updateClientFn });

export const deleteClientMutationOptions = () =>
	mutationOptions({ mutationFn: deleteClientFn });

export const restoreClientMutationOptions = () =>
	mutationOptions({ mutationFn: restoreClientFn });
