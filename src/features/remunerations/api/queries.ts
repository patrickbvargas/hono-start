import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import { authMiddleware, isAdminSession } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import {
	getRemunerationById,
	getRemunerations,
	getRemunerationsForExport,
	getSelectableRemunerationContracts,
	getSelectableRemunerationEmployees,
} from "../data/queries";
import {
	remunerationExportInputSchema,
	remunerationIdInputSchema,
} from "../schemas/form";
import type { Remuneration } from "../schemas/model";
import {
	type RemunerationSearch,
	remunerationSearchSchema,
} from "../schemas/search";
import {
	buildRemunerationPdf,
	buildRemunerationSpreadsheet,
	createRemunerationExportFileName,
} from "../utils/export";

interface RemunerationExportResult {
	fileName: string;
	mimeType: string;
	contentBase64: string;
}

export const remunerationKeys = {
	all: ["remuneration"] as const,
	list: (search: RemunerationSearch) =>
		[...remunerationKeys.all, search] as const,
	detail: (id: number) => [...remunerationKeys.all, "detail", id] as const,
	contractOptions: () => [...remunerationKeys.all, "contract-options"] as const,
	employeeOptions: () => [...remunerationKeys.all, "employee-options"] as const,
};

async function getRemunerationScope() {
	const session = await getRequiredServerLoggedUserSession();
	const scope = await getServerScope("remuneration");

	return {
		session,
		scope: {
			firmId: scope.firmId,
			employeeId: scope.employeeId,
			isAdmin: isAdminSession(session),
		},
	};
}

const getRemunerationsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(remunerationSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<Remuneration>> => {
			try {
				const { scope } = await getRemunerationScope();

				return await getRemunerations({ scope, search: data });
			} catch (error) {
				console.error("[getRemunerations]", error);
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_GET_FAILED);
			}
		},
	);

const getRemunerationByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Remuneration>> => {
		try {
			const { scope } = await getRemunerationScope();

			return await getRemunerationById({ id: data.id, scope });
		} catch (error) {
			console.error("[getRemunerationById]", error);
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_DETAIL_FAILED);
		}
	});

const getSelectableRemunerationContractsFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const { scope } = await getRemunerationScope();

			return await getSelectableRemunerationContracts(scope);
		} catch (error) {
			console.error("[getSelectableRemunerationContracts]", error);
			throw new Error(
				REMUNERATION_ERRORS.REMUNERATION_SELECTABLE_CONTRACTS_FAILED,
			);
		}
	});

const getSelectableRemunerationEmployeesFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const { scope } = await getRemunerationScope();

			return await getSelectableRemunerationEmployees(scope);
		} catch (error) {
			console.error("[getSelectableRemunerationEmployees]", error);
			throw new Error(
				REMUNERATION_ERRORS.REMUNERATION_SELECTABLE_EMPLOYEES_FAILED,
			);
		}
	});

const exportRemunerationsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(remunerationExportInputSchema)
	.handler(async ({ data }): Promise<RemunerationExportResult> => {
		try {
			const { scope } = await getRemunerationScope();
			const remunerations = await getRemunerationsForExport({
				scope,
				search: data,
			});
			const fileName = createRemunerationExportFileName(data.format);

			if (data.format === "pdf") {
				return {
					fileName,
					mimeType: "application/pdf",
					contentBase64: buildRemunerationPdf(remunerations).toString("base64"),
				};
			}

			return {
				fileName,
				mimeType: "text/csv;charset=utf-8",
				contentBase64: Buffer.from(
					buildRemunerationSpreadsheet(remunerations),
					"utf8",
				).toString("base64"),
			};
		} catch (error) {
			console.error("[exportRemunerations]", error);
			throw new Error(REMUNERATION_ERRORS.REMUNERATION_EXPORT_FAILED);
		}
	});

export const getRemunerationsQueryOptions = (search: RemunerationSearch) =>
	queryOptions({
		queryKey: remunerationKeys.list(search),
		queryFn: () => getRemunerationsFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getRemunerationByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: remunerationKeys.detail(id),
		queryFn: () => getRemunerationByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationContractsQueryOptions = () =>
	queryOptions({
		queryKey: remunerationKeys.contractOptions(),
		queryFn: getSelectableRemunerationContractsFn,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationEmployeesQueryOptions = () =>
	queryOptions({
		queryKey: remunerationKeys.employeeOptions(),
		queryFn: getSelectableRemunerationEmployeesFn,
		staleTime: 5 * 60 * 1000,
	});

export const exportRemunerationsMutationOptions = () =>
	mutationOptions({
		mutationFn: exportRemunerationsFn,
	});
