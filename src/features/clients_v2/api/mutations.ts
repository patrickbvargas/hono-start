import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import { create, remove, restore, update } from "../data/mutations";
import {
	clientCreateInputSchema,
	clientIdInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";

const createClient = createServerFn({ method: "POST" })
	.inputValidator(clientCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.create");
			const { firmId } = getServerScope("client");

			return await create({ firmId, input: data });
		} catch (error) {
			console.error("[createClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"]))
				throw new Error(CLIENT_ERRORS.CLIENT_DOCUMENT_DUPLICATE);

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

			throw new Error(CLIENT_ERRORS.CLIENT_CREATE_FAILED);
		}
	});

const updateClient = createServerFn({ method: "POST" })
	.inputValidator(clientUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.update");
			const { firmId } = getServerScope("client");

			return await update({ firmId, input: data });
		} catch (error) {
			console.error("[updateClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"]))
				throw new Error(CLIENT_ERRORS.CLIENT_DOCUMENT_DUPLICATE);

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

			throw new Error(CLIENT_ERRORS.CLIENT_UPDATE_FAILED);
		}
	});

const deleteClient = createServerFn({ method: "POST" })
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.delete");
			const { firmId } = getServerScope("client");

			return await remove({ firmId, id: data.id });
		} catch (error) {
			console.error("[deleteClient]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

			throw new Error(CLIENT_ERRORS.CLIENT_DELETE_FAILED);
		}
	});

const restoreClient = createServerFn({ method: "POST" })
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.restore");
			const { firmId } = getServerScope("client");

			return await restore({ firmId, id: data.id });
		} catch (error) {
			console.error("[restoreClient]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

			throw new Error(CLIENT_ERRORS.CLIENT_RESTORE_FAILED);
		}
	});

export const createClientOptions = () =>
	mutationOptions({ mutationFn: createClient });

export const updateClientOptions = () =>
	mutationOptions({ mutationFn: updateClient });

export const deleteClientOptions = () =>
	mutationOptions({ mutationFn: deleteClient });

export const restoreClientOptions = () =>
	mutationOptions({ mutationFn: restoreClient });
