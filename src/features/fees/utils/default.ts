import type { FeeCreateInput, FeeUpdateInput } from "../schemas/form";
import type { FeeDetail } from "../schemas/model";
import type { FeeSearch } from "../schemas/search";

export const defaultFeeCreateValues = (): FeeCreateInput => ({
	contractId: "",
	revenueId: "",
	paymentDate: "",
	amount: 0,
	installmentNumber: 1,
	generatesRemuneration: true,
	isActive: true,
});

export const defaultFeeUpdateValues = (
	initialValue: FeeDetail,
): FeeUpdateInput => ({
	id: initialValue.id,
	contractId: String(initialValue.contractId),
	revenueId: String(initialValue.revenueId),
	paymentDate: initialValue.paymentDate.slice(0, 10),
	amount: initialValue.amount,
	installmentNumber: initialValue.installmentNumber,
	generatesRemuneration: initialValue.generatesRemuneration,
	isActive: initialValue.isActive,
});

export const feeSearchDefaults: FeeSearch = {
	page: 1,
	limit: 25,
	column: "paymentDate",
	direction: "desc",
	contractId: "",
	revenueId: "",
	dateFrom: "",
	dateTo: "",
	active: "all",
	status: "active",
};
