import type { QueryClient } from "@tanstack/react-query";
import type { FieldOption } from "@/shared/types/field";

export const ENTITY_ACTIVE_FILTER_OPTIONS: FieldOption[] = [
	{ id: "all", label: "Todos" },
	{ id: "true", label: "Ativo" },
	{ id: "false", label: "Inativo" },
];

export const ENTITY_DELETED_VISIBILITY_OPTIONS: FieldOption[] = [
	{ id: "active", label: "Não excluídos" },
	{ id: "deleted", label: "Excluídos" },
	{ id: "all", label: "Todos" },
];

export type EntityActiveFilterValue = "all" | "false" | "true";
export type EntityDeletedVisibilityValue = "active" | "all" | "deleted";

export function getEntityActiveWhere(value: EntityActiveFilterValue) {
	if (value === "true") {
		return { isActive: true };
	}

	if (value === "false") {
		return { isActive: false };
	}

	return {};
}

export function getEntityDeletedVisibilityWhere(
	value: EntityDeletedVisibilityValue,
) {
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
	cacheKey: string,
) {
	await queryClient.invalidateQueries({ queryKey: [cacheKey] });
}

export function getMutationErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Ocorreu um erro inesperado";
}
