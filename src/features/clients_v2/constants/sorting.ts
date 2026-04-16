import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Client } from "../schemas/model";

export const CLIENT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Client> = [
	"createdAt",
	"document",
	"fullName",
	"isActive",
	"type",
] as const;
