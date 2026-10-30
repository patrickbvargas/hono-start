import { useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getEmployeeTypesQueryOptions,
	getPeopleQueryOptions,
	getPersonByIdQueryOptions,
	getPersonFinanceQueryOptions,
	getPersonTypesQueryOptions,
} from "../api/queries";
import type { PersonSearch } from "../schemas/search";

export function usePeople(search: PersonSearch) {
	const { data: people } = useSuspenseQuery(getPeopleQueryOptions(search));

	return { people };
}

export function usePerson(id: EntityId) {
	const { data: person } = useSuspenseQuery(getPersonByIdQueryOptions(id));

	return { person };
}

export function usePersonOptions() {
	const { data: types } = useSuspenseQuery(getPersonTypesQueryOptions());

	const { data: employeeTypes } = useSuspenseQuery(
		getEmployeeTypesQueryOptions(),
	);
	return { types, employeeTypes };
}

export function usePersonFinance(id: EntityId) {
	const { data: finance } = useSuspenseQuery(getPersonFinanceQueryOptions(id));
	return { finance };
}
