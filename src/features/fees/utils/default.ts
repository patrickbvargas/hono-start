import type { FeeCreateInput, FeeUpdateInput } from "../schemas/form";
import type { FeeDetail } from "../schemas/model";

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
