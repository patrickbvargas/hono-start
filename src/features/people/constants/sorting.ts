import type { NonEmptyKeys } from "@/shared/types/utils";
import type { PersonSummary } from "../schemas/model";

export const PERSON_ALLOWED_SORT_COLUMNS: NonEmptyKeys<PersonSummary> = [
	"document",
	"fullName",
	"id",
	"isActive",
	"type",
] as const;
