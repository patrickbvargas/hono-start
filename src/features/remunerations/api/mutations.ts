import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import {
	deleteRemuneration,
	restoreRemuneration,
	updateRemuneration,
} from "../data/mutations";
import { getRemunerationAccessResourceById } from "../data/queries";
import {
	remunerationIdInputSchema,
	remunerationUpdateInputSchema,
} from "../schemas/form";

async function getAuthorizedRemunerationAccess(
	action:
		| "remuneration.view"
		| "remuneration.update"
		| "remuneration.delete"
		| "remuneration.restore",
	id: number,
) {
	const session = getServerLoggedUserSession();
	const { firmId } = getServerScope("remuneration");
	const access = await getRemunerationAccessResourceById(firmId, id);

	if (!access) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_NOT_FOUND);
	}

	assertCan(session, action, access.resource);

	return access;
}

const updateRemunerationFn = createServerFn({ method: "POST" })
	.inputValidator(remunerationUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const access = await getAuthorizedRemunerationAccess(
				"remuneration.update",
				data.id,
			);

			return await updateRemuneration({ access, input: data });
		} catch (error) {
			console.error("[updateRemuneration]", error);
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_UPDATE_FAILED);
		}
	});

const deleteRemunerationFn = createServerFn({ method: "POST" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			await getAuthorizedRemunerationAccess("remuneration.delete", data.id);

			return await deleteRemuneration(data.id);
		} catch (error) {
			console.error("[deleteRemuneration]", error);
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_DELETE_FAILED);
		}
	});

const restoreRemunerationFn = createServerFn({ method: "POST" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const access = await getAuthorizedRemunerationAccess(
				"remuneration.restore",
				data.id,
			);

			return await restoreRemuneration({ access, id: data.id });
		} catch (error) {
			console.error("[restoreRemuneration]", error);
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_RESTORE_FAILED);
		}
	});

export const updateRemunerationMutationOptions = () =>
	mutationOptions({
		mutationFn: updateRemunerationFn,
	});

export const deleteRemunerationMutationOptions = () =>
	mutationOptions({
		mutationFn: deleteRemunerationFn,
	});

export const restoreRemunerationMutationOptions = () =>
	mutationOptions({
		mutationFn: restoreRemunerationFn,
	});
