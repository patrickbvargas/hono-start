import type { RemunerationUpdateInput } from "../schemas/form";
import type { Remuneration } from "../schemas/model";
import type { RemunerationSearch } from "../schemas/search";

export const defaultRemunerationUpdateValues = (
	remuneration: Remuneration,
): RemunerationUpdateInput => ({
	id: remuneration.id,
	amount: remuneration.amount,
	effectivePercentage: remuneration.effectivePercentage,
});

export const remunerationSearchDefaults: RemunerationSearch = {
	page: 1,
	limit: 25,
	column: "paymentDate",
	direction: "desc",
	employeeId: "",
	contractId: "",
	dateFrom: "",
	dateTo: "",
	active: "all",
	status: "active",
};
