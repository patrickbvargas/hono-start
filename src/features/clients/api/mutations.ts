import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { assertCan } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
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
	.inputValidator(clientCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "client.create");
			const { firmId } = await getServerScope("client");

			return await createClient({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
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
	.inputValidator(clientUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "client.update");
			const { firmId } = await getServerScope("client");

			return await updateClient({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
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
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "client.delete");
			const { firmId } = await getServerScope("client");

			return await deleteClient({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
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
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "client.restore");
			const { firmId } = await getServerScope("client");

			return await restoreClient({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
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
