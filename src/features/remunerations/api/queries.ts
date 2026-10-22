import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import { assertCan, hasPermission } from "@/shared/session";
import { authMiddleware } from "@/shared/session/middleware";
import { getRequiredServerLoggedUserSession } from "@/shared/session/server";
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
	buildRemunerationSpreadsheetBuffer,
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

async function getRemunerationScope(exporting = false) {
	const session = await getRequiredServerLoggedUserSession();
	assertCan(
		session,
		exporting
			? ["org:remunerations:export_all", "org:remunerations:export_own"]
			: ["org:remunerations:read_all", "org:remunerations:read_own"],
	);
	const all = hasPermission(
		session,
		exporting ? "org:remunerations:export_all" : "org:remunerations:read_all",
	);

	return {
		session,
		scope: {
			firmId: session.firm.id,
			employeeId: all ? undefined : session.employee.id,
			isAdmin: all,
		},
	};
}

const getRemunerationsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(remunerationSearchSchema)
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
	.validator(remunerationIdInputSchema)
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
	.validator(remunerationExportInputSchema)
	.handler(async ({ data }): Promise<RemunerationExportResult> => {
		try {
			const { scope } = await getRemunerationScope(true);
			const remunerations = await getRemunerationsForExport({
				scope,
				search: data,
			});
			const fileName = createRemunerationExportFileName(data.format);

			if (data.format === "pdf") {
				const pdfBuffer = await buildRemunerationPdf(remunerations);

				return {
					fileName,
					mimeType: "application/pdf",
					contentBase64: pdfBuffer.toString("base64"),
				};
			}

			return {
				fileName,
				mimeType: "text/csv;charset=utf-16le",
				contentBase64:
					buildRemunerationSpreadsheetBuffer(remunerations).toString("base64"),
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
	});

export const getRemunerationByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: remunerationKeys.detail(id),
		queryFn: () => getRemunerationByIdFn({ data: { id } }),
	});

export const getSelectableRemunerationContractsQueryOptions = () =>
	queryOptions({
		queryKey: remunerationKeys.contractOptions(),
		queryFn: getSelectableRemunerationContractsFn,
	});

export const getSelectableRemunerationEmployeesQueryOptions = () =>
	queryOptions({
		queryKey: remunerationKeys.employeeOptions(),
		queryFn: getSelectableRemunerationEmployeesFn,
	});

export const exportRemunerationsMutationOptions = () =>
	mutationOptions({
		mutationFn: exportRemunerationsFn,
	});
