import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { FieldOption } from "@/shared/types/field";

export const ENTITY_ACTIVE_FILTER_OPTIONS: FieldOption[] = [
	{ value: "all", label: "Todos" },
	{ value: "true", label: "Ativo" },
	{ value: "false", label: "Inativo" },
];

export const ENTITY_DELETED_FILTER_OPTIONS: FieldOption[] = [
	{ value: "active", label: "Não excluídos" },
	{ value: "deleted", label: "Excluídos" },
	{ value: "all", label: "Todos" },
];

export type EntityActiveFilterValue = "all" | "false" | "true";
export type EntityDeletedFilterValue = "active" | "all" | "deleted";

export function getEntityActiveWhere(value: EntityActiveFilterValue) {
	if (value === "true") {
		return { isActive: true };
	}

	if (value === "false") {
		return { isActive: false };
	}

	return {};
}

export function getEntityDeletedWhere(value: EntityDeletedFilterValue) {
	if (value === "deleted") {
		return { deletedAt: { not: null } };
	}

	if (value === "all") {
		return {};
	}

	return { deletedAt: null };
}

export function withDeterministicTieBreaker<TOrderBy>(
	primaryOrderBy: TOrderBy,
	tieBreakerOrderBy: TOrderBy,
) {
	return [primaryOrderBy, tieBreakerOrderBy];
}

export async function refreshEntityQueries(
	queryClient: QueryClient,
	queryKey: QueryKey,
) {
	await queryClient.invalidateQueries({ queryKey });
}

export function getMutationErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Ocorreu um erro inesperado";
}
