import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { EntityId } from "@/shared/schemas/entity";
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
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	getContractAssignmentTypes,
	getContractById,
	getContractLegalAreas,
	getContractRevenueTypes,
	getContractStatuses,
	getContracts,
	getSelectableContractClients,
	getSelectableContractEmployees,
} from "../data/queries";
import { contractIdInputSchema } from "../schemas/form";
import type { ContractDetail, ContractSummary } from "../schemas/model";
import { type ContractSearch, contractSearchSchema } from "../schemas/search";

export const contractKeys = {
	all: ["contract"] as const,
	list: (search: ContractSearch) => [...contractKeys.all, search] as const,
	detail: (id: EntityId) => [...contractKeys.all, "detail", id] as const,
	legalAreas: () => [...contractKeys.all, "legal-areas"] as const,
	statuses: () => [...contractKeys.all, "statuses"] as const,
	assignmentTypes: () => [...contractKeys.all, "assignment-types"] as const,
	revenueTypes: () => [...contractKeys.all, "revenue-types"] as const,
	clientOptions: () => [...contractKeys.all, "client-options"] as const,
	employeeOptions: () => [...contractKeys.all, "employee-options"] as const,
};

const getContractsFn = createServerFn({ method: "GET" })
	.inputValidator(contractSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<ContractSummary>> => {
			try {
				const session = getServerLoggedUserSession();
				const scope = getServerScope("contract");

				return await getContracts({
					scope: {
						firmId: scope.firmId,
						employeeId: scope.employeeId,
						isAdmin: isAdminSession(session),
					},
					search: data,
				});
			} catch (error) {
				console.error("[getContracts]", error);
				throw new Error(CONTRACT_ERRORS.CONTRACT_GET_FAILED);
			}
		},
	);

const getContractByIdFn = createServerFn({ method: "GET" })
	.inputValidator(contractIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<ContractDetail>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("contract");

			return await getContractById({
				scope: {
					firmId: scope.firmId,
					employeeId: scope.employeeId,
					isAdmin: isAdminSession(session),
				},
				id: data.id,
			});
		} catch (error) {
			console.error("[getContractById]", error);
			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_DETAIL_FAILED);
		}
	});

const getContractLegalAreasFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			return await getContractLegalAreas();
		} catch (error) {
			console.error("[getContractLegalAreas]", error);
			throw new Error(CONTRACT_ERRORS.CONTRACT_LEGAL_AREAS_FAILED);
		}
	},
);

const getContractStatusesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			return await getContractStatuses();
		} catch (error) {
			console.error("[getContractStatuses]", error);
			throw new Error(CONTRACT_ERRORS.CONTRACT_STATUSES_FAILED);
		}
	},
);

const getContractAssignmentTypesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			return await getContractAssignmentTypes();
		} catch (error) {
			console.error("[getContractAssignmentTypes]", error);
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPES_FAILED);
		}
	},
);

const getContractRevenueTypesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			return await getContractRevenueTypes();
		} catch (error) {
			console.error("[getContractRevenueTypes]", error);
			throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPES_FAILED);
		}
	},
);

const getSelectableContractClientsFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		getServerLoggedUserSession();
		const { firmId } = getServerScope("contract");
		return await getSelectableContractClients(firmId);
	} catch (error) {
		console.error("[getSelectableContractClients]", error);
		throw new Error(CONTRACT_ERRORS.CONTRACT_SELECTABLE_CLIENTS_FAILED);
	}
});

const getSelectableContractEmployeesFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		getServerLoggedUserSession();
		const { firmId } = getServerScope("contract");
		return await getSelectableContractEmployees(firmId);
	} catch (error) {
		console.error("[getSelectableContractEmployees]", error);
		throw new Error(CONTRACT_ERRORS.CONTRACT_SELECTABLE_EMPLOYEES_FAILED);
	}
});

export const getContractsQueryOptions = (search: ContractSearch) =>
	queryOptions({
		queryKey: contractKeys.list(search),
		queryFn: () => getContractsFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getContractByIdQueryOptions = (id: EntityId) =>
	queryOptions({
		queryKey: contractKeys.detail(id),
		queryFn: () => getContractByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getContractLegalAreasQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.legalAreas(),
		queryFn: getContractLegalAreasFn,
		staleTime: "static",
	});

export const getContractStatusesQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.statuses(),
		queryFn: getContractStatusesFn,
		staleTime: "static",
	});

export const getContractAssignmentTypesQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.assignmentTypes(),
		queryFn: getContractAssignmentTypesFn,
		staleTime: "static",
	});

export const getContractRevenueTypesQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.revenueTypes(),
		queryFn: getContractRevenueTypesFn,
		staleTime: "static",
	});

export const getSelectableContractClientsQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.clientOptions(),
		queryFn: getSelectableContractClientsFn,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableContractEmployeesQueryOptions = () =>
	queryOptions({
		queryKey: contractKeys.employeeOptions(),
		queryFn: getSelectableContractEmployeesFn,
		staleTime: 5 * 60 * 1000,
	});
