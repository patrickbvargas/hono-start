import type { SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export type QueryFields<T> = {
	[K in keyof T]?: PgColumn | SQL;
};

export type QueryOneReturnType<T> = T;

export type QueryManyReturnType<T> = T[];

export type QueryPaginatedReturnType<T> = {
	items: T[];
	total: number;
};
