import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Client } from "../schemas/model";

export const CLIENT_DATA_CACHE_KEY = "client" as const;

export const CLIENT_TYPE_COMPANY_VALUE = "COMPANY" as const;
export const CLIENT_TYPE_INDIVIDUAL_VALUE = "INDIVIDUAL" as const;

export const CLIENT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Client> = [
	"createdAt",
	"document",
	"fullName",
	"isActive",
	"type",
] as const;
