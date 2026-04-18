import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import {
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants/cache";
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

function getRemunerationScope() {
	const session = getServerLoggedUserSession();
	const scope = getServerScope("remuneration");

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
	.inputValidator(remunerationSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<Remuneration>> => {
			try {
				const { scope } = getRemunerationScope();

				return await getRemunerations({ scope, search: data });
			} catch (error) {
				console.error("[getRemunerations]", error);
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_GET_FAILED);
			}
		},
	);

const getRemunerationByIdFn = createServerFn({ method: "GET" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Remuneration>> => {
		try {
			const { scope } = getRemunerationScope();

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
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		const { scope } = getRemunerationScope();

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
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		const { scope } = getRemunerationScope();

		return await getSelectableRemunerationEmployees(scope);
	} catch (error) {
		console.error("[getSelectableRemunerationEmployees]", error);
		throw new Error(
			REMUNERATION_ERRORS.REMUNERATION_SELECTABLE_EMPLOYEES_FAILED,
		);
	}
});

const exportRemunerationsFn = createServerFn({ method: "POST" })
	.inputValidator(remunerationExportInputSchema)
	.handler(async ({ data }): Promise<RemunerationExportResult> => {
		try {
			const { scope } = getRemunerationScope();
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

export const getRemunerationsOptions = (search: RemunerationSearch) =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, search],
		queryFn: () => getRemunerationsFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getRemunerationByIdOptions = (id: number) =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getRemunerationByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationContractsOptions = () =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "contract-options"],
		queryFn: getSelectableRemunerationContractsFn,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationEmployeesOptions = () =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "employee-options"],
		queryFn: getSelectableRemunerationEmployeesFn,
		staleTime: 5 * 60 * 1000,
	});

export const exportRemunerationsOptions = () =>
	mutationOptions({
		mutationFn: exportRemunerationsFn,
	});
