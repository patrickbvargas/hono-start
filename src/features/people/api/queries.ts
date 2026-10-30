import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasPermission } from "@/shared/session";
import { authMiddleware } from "@/shared/session/server";
import { assertPersonDirectoryRead } from "../data/access";
import {
	getEmployeeTypes,
	getPeople,
	getPersonById,
	getPersonFinance,
	getPersonTypes,
} from "../data/queries";
import { personIdInputSchema } from "../schemas/form";
import { type PersonSearch, personSearchSchema } from "../schemas/search";
export const personKeys = {
	all: ["person"] as const,
	list: (s: PersonSearch) => ["person", "list", s] as const,
	detail: (id: number) => ["person", "detail", id] as const,
	types: () => ["person", "types"] as const,
	employeeTypes: () => ["person", "employee-types"] as const,
	finance: (id: number) => ["person", "finance", id] as const,
};
const getPeopleFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(personSearchSchema)
	.handler(({ data, context }) =>
		getPeople({ session: context.session, search: data }),
	);
const getPersonFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(personIdInputSchema)
	.handler(({ data, context }) =>
		getPersonById({ session: context.session, id: data.id }),
	);
const getTypesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => {
		assertPersonDirectoryRead(context.session);
		return getPersonTypes();
	});
const getEmployeeTypesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) =>
		hasPermission(context.session, "org:employees:read")
			? getEmployeeTypes()
			: [],
	);
const getFinanceFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(personIdInputSchema)
	.handler(({ data, context }) =>
		getPersonFinance({ session: context.session, id: data.id }),
	);
export const getPeopleQueryOptions = (search: PersonSearch) =>
	queryOptions({
		queryKey: personKeys.list(search),
		queryFn: () => getPeopleFn({ data: search }),
	});
export const getPersonByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: personKeys.detail(id),
		queryFn: () => getPersonFn({ data: { id } }),
	});
export const getPersonTypesQueryOptions = () =>
	queryOptions({
		queryKey: personKeys.types(),
		queryFn: getTypesFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});
export const getEmployeeTypesQueryOptions = () =>
	queryOptions({
		queryKey: personKeys.employeeTypes(),
		queryFn: getEmployeeTypesFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});
export const getPersonFinanceQueryOptions = (id: number) =>
	queryOptions({
		queryKey: personKeys.finance(id),
		queryFn: () => getFinanceFn({ data: { id } }),
		meta: { refreshOnMutation: true },
	});
