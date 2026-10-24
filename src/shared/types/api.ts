export type QueryOneReturnType<T> = T;

export type QueryManyReturnType<T> = T[];

export type QueryPaginatedReturnType<T> = {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
};

export type MutationReturnType = { success: true };

export type FinancialQueryPaginatedReturnType<T> =
	QueryPaginatedReturnType<T> & {
		totalAmount: number;
	};
