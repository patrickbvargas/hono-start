import type { NonEmptyKeys } from "@/shared/types/utils";
import type { ClientSummary } from "../schemas/model";

export const CLIENT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<ClientSummary> = [
	"document",
	"fullName",
	"isActive",
	"type",
] as const;
